import axios, { AxiosInstance } from 'axios';
import { config } from '../config';
import { logger } from '../lib/logger';

// --- Token bucket rate limiter (100 req / 2s) ---

class TokenBucket {
  private tokens: number;
  private lastRefill: number;

  constructor(
    private maxTokens: number,
    private refillIntervalMs: number
  ) {
    this.tokens = maxTokens;
    this.lastRefill = Date.now();
  }

  async acquire(): Promise<void> {
    this.refill();
    if (this.tokens > 0) {
      this.tokens--;
      return;
    }
    // Wait until next refill
    const waitMs = this.refillIntervalMs - (Date.now() - this.lastRefill);
    await new Promise((resolve) => setTimeout(resolve, Math.max(waitMs, 50)));
    return this.acquire();
  }

  private refill(): void {
    const now = Date.now();
    if (now - this.lastRefill >= this.refillIntervalMs) {
      this.tokens = this.maxTokens;
      this.lastRefill = now;
    }
  }
}

const bucket = new TokenBucket(80, 2000); // 80 of 100 to leave headroom

// --- Axios client ---

function createClient(): AxiosInstance {
  return axios.create({
    baseURL: config.pipedrive.baseUrl,
    params: { api_token: config.pipedrive.apiToken },
    timeout: 10000,
  });
}

let client: AxiosInstance | null = null;

function getClient(): AxiosInstance {
  if (!client) client = createClient();
  return client;
}

function ensureConfigured(): void {
  if (!config.pipedrive.apiToken) {
    throw new Error('PIPEDRIVE_API_TOKEN is not configured');
  }
}

// --- Search methods ---

export interface PipedriveSearchResult {
  id: number;
  name?: string;
  email?: string;
  org_id?: number;
  [key: string]: unknown;
}

export async function searchPersonByEmail(email: string): Promise<PipedriveSearchResult | null> {
  ensureConfigured();
  await bucket.acquire();

  const { data } = await getClient().get('/persons/search', {
    params: { term: email, fields: 'email', limit: 1 },
  });

  const items = data?.data?.items;
  if (!items || items.length === 0) return null;

  const item = items[0].item;
  logger.debug({ email, person_id: item.id }, 'Pipedrive person found');
  return { id: item.id, name: item.name, email, org_id: item.org_id };
}

export async function searchOrgByDomain(domain: string): Promise<PipedriveSearchResult | null> {
  ensureConfigured();
  await bucket.acquire();

  // Pipedrive v1: search organizations, match on cc_email or address-related fields
  // The most reliable way is a general search with the domain
  const { data } = await getClient().get('/organizations/search', {
    params: { term: domain, limit: 5 },
  });

  const items = data?.data?.items;
  if (!items || items.length === 0) return null;

  // Look for an org whose name or cc_email contains the domain
  const match = items.find(
    (i: { item: { cc_email?: string; name?: string } }) =>
      i.item.cc_email?.includes(domain) ||
      i.item.name?.toLowerCase().includes(domain.split('.')[0])
  );

  if (!match) return null;

  logger.debug({ domain, org_id: match.item.id }, 'Pipedrive org found by domain');
  return { id: match.item.id, name: match.item.name };
}

export async function searchOrgByName(companyName: string): Promise<PipedriveSearchResult | null> {
  ensureConfigured();
  await bucket.acquire();

  const { data } = await getClient().get('/organizations/search', {
    params: { term: companyName, limit: 1 },
  });

  const items = data?.data?.items;
  if (!items || items.length === 0) return null;

  const item = items[0].item;
  logger.debug({ company: companyName, org_id: item.id }, 'Pipedrive org found by name');
  return { id: item.id, name: item.name };
}

export async function getOpenDeals(orgId: number): Promise<{ id: number; title: string }[]> {
  ensureConfigured();
  await bucket.acquire();

  const { data } = await getClient().get(`/organizations/${orgId}/deals`, {
    params: { status: 'open', limit: 5 },
  });

  if (!data?.data) return [];
  return data.data.map((d: { id: number; title: string }) => ({ id: d.id, title: d.title }));
}

// --- Create methods ---

export interface CreateOrgPayload {
  name: string;
  owner_id?: number;
}

export async function createOrganization(payload: CreateOrgPayload): Promise<{ id: number; name: string }> {
  ensureConfigured();
  await bucket.acquire();

  const body: Record<string, unknown> = {
    name: payload.name,
    owner_id: payload.owner_id || config.pipedrive.ownerId || undefined,
  };

  const { data } = await getClient().post('/organizations', body);
  logger.info({ org_id: data.data.id, name: payload.name }, 'Pipedrive organization created');
  return { id: data.data.id, name: data.data.name };
}

export interface CreatePersonPayload {
  name: string;
  email: string;
  org_id?: number;
  phone?: string;
  owner_id?: number;
  custom_fields?: Record<string, unknown>;
}

export async function createPerson(payload: CreatePersonPayload): Promise<{ id: number; name: string }> {
  ensureConfigured();
  await bucket.acquire();

  const body: Record<string, unknown> = {
    name: payload.name,
    email: [payload.email],
    org_id: payload.org_id || undefined,
    phone: payload.phone ? [payload.phone] : undefined,
    owner_id: payload.owner_id || config.pipedrive.ownerId || undefined,
  };

  const fields = config.pipedrive.fields;
  if (payload.custom_fields) {
    if (fields.cargo && payload.custom_fields.cargo) {
      body[fields.cargo] = payload.custom_fields.cargo;
    }
    if (fields.linkedinUrl && payload.custom_fields.linkedin_url) {
      body[fields.linkedinUrl] = payload.custom_fields.linkedin_url;
    }
    if (fields.campaign && payload.custom_fields.campaign) {
      body[fields.campaign] = payload.custom_fields.campaign;
    }
  }

  const { data } = await getClient().post('/persons', body);
  logger.info({ person_id: data.data.id, name: payload.name }, 'Pipedrive person created');
  return { id: data.data.id, name: data.data.name };
}

export interface CreateDealPayload {
  title: string;
  org_id?: number;
  person_id?: number;
  pipeline_id?: number;
  owner_id?: number;
  custom_fields?: Record<string, unknown>;
}

export async function createDeal(payload: CreateDealPayload): Promise<{ id: number; title: string }> {
  ensureConfigured();
  await bucket.acquire();

  const body: Record<string, unknown> = {
    title: payload.title,
    org_id: payload.org_id || undefined,
    person_id: payload.person_id || undefined,
    pipeline_id: payload.pipeline_id || config.pipedrive.pipelineId || undefined,
    user_id: payload.owner_id || config.pipedrive.ownerId || undefined,
  };

  if (payload.custom_fields) {
    const fields = config.pipedrive.fields;
    if (fields.source && payload.custom_fields.source) {
      body[fields.source] = payload.custom_fields.source;
    }
    if (fields.numLocations && payload.custom_fields.num_locations != null) {
      body[fields.numLocations] = payload.custom_fields.num_locations;
    }
    if (fields.conceptType && payload.custom_fields.concept_type) {
      body[fields.conceptType] = payload.custom_fields.concept_type;
    }
    if (fields.pos && payload.custom_fields.pos) {
      body[fields.pos] = payload.custom_fields.pos;
    }
  }

  const { data } = await getClient().post('/deals', body);
  logger.info({ deal_id: data.data.id, title: payload.title }, 'Pipedrive deal created');
  return { id: data.data.id, title: data.data.title };
}

export async function addNote(
  content: string,
  options: { deal_id?: number; person_id?: number; org_id?: number }
): Promise<{ id: number }> {
  ensureConfigured();
  await bucket.acquire();

  const { data } = await getClient().post('/notes', {
    content,
    ...options,
  });

  logger.debug({ note_id: data.data.id }, 'Pipedrive note added');
  return { id: data.data.id };
}

// --- Full lead creation flow ---

export async function createLeadInPipedrive(payload: {
  name: string;
  email: string;
  company: string;
  phone?: string;
  source?: string;
  campaign?: string;
  num_locations?: number;
  concept_type?: string;
  pos?: string;
  cargo?: string;
  linkedin_url?: string;
  existing_org_id?: number;
}): Promise<{ org_id: number; person_id: number; deal_id: number }> {
  // Step 1: Create or reuse org
  let orgId = payload.existing_org_id;
  if (!orgId) {
    const org = await createOrganization({ name: payload.company });
    orgId = org.id;
  }

  // Step 2: Create person linked to org
  const person = await createPerson({
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    org_id: orgId,
    custom_fields: {
      cargo: payload.cargo,
      linkedin_url: payload.linkedin_url,
      campaign: payload.campaign,
    },
  });

  // Step 3: Create deal with deal-level custom fields
  const deal = await createDeal({
    title: `${payload.company} — ${payload.source || 'Marketing Ops'}`,
    org_id: orgId,
    person_id: person.id,
    custom_fields: {
      source: payload.source,
      num_locations: payload.num_locations,
      concept_type: payload.concept_type,
      pos: payload.pos,
    },
  });

  // Step 4: Add audit note
  await addNote(
    `Lead created via Marketing Ops\nSource: ${payload.source || 'N/A'}\nCampaign: ${payload.campaign || 'N/A'}\nCreated: ${new Date().toISOString()}`,
    { deal_id: deal.id }
  );

  logger.info(
    { org_id: orgId, person_id: person.id, deal_id: deal.id },
    'Full lead created in Pipedrive'
  );

  return { org_id: orgId, person_id: person.id, deal_id: deal.id };
}
