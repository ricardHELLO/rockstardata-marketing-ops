import { query, queryOne } from '../lib/db';
import { logger } from '../lib/logger';
import { checkBlacklist } from './blacklist.service';
import { createApproval } from './approvals.service';
import {
  LeadContact,
  NormalizedLead,
  DedupResult,
  LeadRecord,
  LeadSource,
  LeadStatus,
} from '../types';

// --- Normalization ---

const GENERIC_DOMAINS = new Set([
  'gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'icloud.com',
  'live.com', 'protonmail.com', 'mail.com', 'aol.com', 'zoho.com',
]);

function extractDomain(email: string): string {
  return email.split('@')[1]?.toLowerCase() ?? '';
}

function normalizeCompanyName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[.,;:!?'"(){}[\]]/g, '')
    .replace(/\b(s\.?a\.?|s\.?l\.?|s\.?l\.?u\.?|group|grupo|corp|inc|ltd|gmbh)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeLead(contact: LeadContact): NormalizedLead {
  const email = contact.email.trim().toLowerCase();
  const domain = extractDomain(email);

  return {
    name: contact.name.trim(),
    email,
    domain,
    phone: contact.phone?.trim(),
    company: contact.company.trim(),
    company_normalized: normalizeCompanyName(contact.company),
    num_locations: contact.num_locations,
    concept_type: contact.concept_type?.trim(),
    pos: contact.pos?.trim(),
    cargo: contact.cargo?.trim(),
    linkedin_url: contact.linkedin_url,
  };
}

// --- Dedup Logic ---
// In Phase B, dedup runs against our own DB.
// In Phase C, it will also query Pipedrive.

async function dedupLead(normalized: NormalizedLead): Promise<DedupResult> {
  const result: DedupResult = {
    person_found: false,
    org_found: false,
    has_open_deal: false,
    status: 'net_new',
  };

  // Step 1: Search existing leads by email
  const existingByEmail = await queryOne<LeadRecord>(
    `SELECT * FROM leads_intake WHERE normalized->>'email' = $1 AND status NOT IN ('rejected', 'blacklisted') ORDER BY created_at DESC LIMIT 1`,
    [normalized.email]
  );

  if (existingByEmail) {
    result.person_found = true;
    result.pipedrive_person_id = existingByEmail.pipedrive_person_id ?? undefined;
    result.pipedrive_org_id = existingByEmail.pipedrive_org_id ?? undefined;
  }

  // Step 2: Search org by domain (skip generic domains)
  if (!GENERIC_DOMAINS.has(normalized.domain)) {
    const existingByDomain = await queryOne<LeadRecord>(
      `SELECT * FROM leads_intake WHERE normalized->>'domain' = $1 AND status NOT IN ('rejected', 'blacklisted') ORDER BY created_at DESC LIMIT 1`,
      [normalized.domain]
    );

    if (existingByDomain) {
      result.org_found = true;
      result.org_match_type = 'domain';
      result.pipedrive_org_id = existingByDomain.pipedrive_org_id ?? result.pipedrive_org_id;
    }
  }

  // Step 3: If no org by domain, search by normalized company name
  if (!result.org_found) {
    const existingByName = await queryOne<LeadRecord>(
      `SELECT * FROM leads_intake WHERE normalized->>'company_normalized' = $1 AND status NOT IN ('rejected', 'blacklisted') ORDER BY created_at DESC LIMIT 1`,
      [normalized.company_normalized]
    );

    if (existingByName) {
      result.org_found = true;
      result.org_match_type = 'name';
      result.pipedrive_org_id = existingByName.pipedrive_org_id ?? result.pipedrive_org_id;
    }
  }

  // Determine status
  if (result.person_found && result.org_found) {
    // Check if there's an existing lead that's already in CRM or has a deal
    const existingInCrm = await queryOne<LeadRecord>(
      `SELECT * FROM leads_intake WHERE normalized->>'email' = $1 AND status = 'in_crm' LIMIT 1`,
      [normalized.email]
    );

    result.status = existingInCrm ? 'duplicate_with_deal' : 'existing_contact';
  } else if (result.person_found && !result.org_found) {
    result.status = 'orphan_contact';
  } else if (!result.person_found && result.org_found) {
    result.status = 'new_contact_existing_org';
  } else {
    result.status = 'net_new';
  }

  return result;
}

// --- Lead Processing ---

interface ProcessResult {
  lead_id: string;
  status: LeadStatus;
  rejection_reason?: string;
  dedup_result?: DedupResult;
  approval_id?: string;
}

export async function processContact(
  contact: LeadContact,
  source: LeadSource,
  campaign?: string
): Promise<ProcessResult> {
  // Step 1: Normalize
  const normalized = normalizeLead(contact);

  // Step 2: Blacklist check
  const blacklistCheck = await checkBlacklist(normalized.email, normalized.domain, normalized.company);

  if (blacklistCheck.blocked) {
    const row = await queryOne<LeadRecord>(
      `INSERT INTO leads_intake (raw_payload, normalized, source, campaign, status, rejection_reason)
       VALUES ($1, $2, $3, $4, 'blacklisted', $5)
       RETURNING *`,
      [
        JSON.stringify(contact),
        JSON.stringify(normalized),
        source,
        campaign ?? null,
        `Blacklisted: ${blacklistCheck.type} = ${blacklistCheck.value} (${blacklistCheck.reason})`,
      ]
    );

    logger.info(
      { lead_id: row!.id, blacklist_type: blacklistCheck.type, value: blacklistCheck.value },
      'Lead blocked by blacklist'
    );

    return {
      lead_id: row!.id,
      status: 'blacklisted',
      rejection_reason: row!.rejection_reason ?? undefined,
    };
  }

  // Step 3: Dedup
  const dedupResult = await dedupLead(normalized);

  // Step 4: Insert lead
  const row = await queryOne<LeadRecord>(
    `INSERT INTO leads_intake (raw_payload, normalized, source, campaign, status, dedup_result, pipedrive_person_id, pipedrive_org_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      JSON.stringify(contact),
      JSON.stringify(normalized),
      source,
      campaign ?? null,
      dedupResult.status,
      JSON.stringify(dedupResult),
      dedupResult.pipedrive_person_id ?? null,
      dedupResult.pipedrive_org_id ?? null,
    ]
  );

  logger.info(
    { lead_id: row!.id, status: dedupResult.status, email: normalized.email },
    'Lead processed'
  );

  const result: ProcessResult = {
    lead_id: row!.id,
    status: dedupResult.status,
    dedup_result: dedupResult,
  };

  // Step 5: Create approval for actionable leads
  if (dedupResult.status === 'net_new' || dedupResult.status === 'new_contact_existing_org') {
    const approval = await createApproval({
      type: 'crm_create',
      agent_name: 'CRM Hygiene Agent',
      summary: `Create ${normalized.company} (${normalized.name}) in Pipedrive — ${dedupResult.status === 'net_new' ? 'new org + person' : 'new person in existing org'}`,
      payload_after: { normalized, dedup_result: dedupResult },
      priority: 'normal',
      linked_lead_id: row!.id,
      action_type: 'create_in_pipedrive',
    });

    result.approval_id = approval.id;
  }

  return result;
}

export async function processIntake(
  source: LeadSource,
  campaign: string | undefined,
  contacts: LeadContact[]
): Promise<{
  created: number;
  blocked: number;
  duplicates: number;
  results: ProcessResult[];
}> {
  const results: ProcessResult[] = [];
  let created = 0;
  let blocked = 0;
  let duplicates = 0;

  for (const contact of contacts) {
    const result = await processContact(contact, source, campaign);
    results.push(result);

    if (result.status === 'blacklisted') {
      blocked++;
    } else if (result.status === 'duplicate_with_deal' || result.status === 'existing_contact') {
      duplicates++;
    } else {
      created++;
    }
  }

  return { created, blocked, duplicates, results };
}

// --- Query ---

export async function listLeads(
  status?: string,
  campaign?: string,
  limit = 50,
  offset = 0
): Promise<LeadRecord[]> {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (status) {
    params.push(status);
    conditions.push(`status = $${params.length}`);
  }

  if (campaign) {
    params.push(campaign);
    conditions.push(`campaign = $${params.length}`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  params.push(limit, offset);

  return query<LeadRecord>(
    `SELECT * FROM leads_intake ${where} ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );
}
