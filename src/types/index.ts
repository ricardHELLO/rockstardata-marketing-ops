export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type LeadStatus =
  | 'raw'
  | 'enriched'
  | 'ready_for_crm'
  | 'in_crm'
  | 'rejected'
  | 'blacklisted'
  | 'net_new'
  | 'new_contact_existing_org'
  | 'existing_contact'
  | 'duplicate_with_deal'
  | 'orphan_contact';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'expired';

export type ApprovalType =
  | 'content_linkedin'
  | 'content_newsletter'
  | 'outbound_email'
  | 'crm_create'
  | 'crm_create_bulk'
  | 'crm_stage_change'
  | 'instantly_draft';

export type ApprovalPriority = 'low' | 'normal' | 'high' | 'urgent';

export type LeadSource = 'outbound' | 'inbound_form' | 'scraper' | 'import' | 'webhook';

export type BlacklistType = 'domain' | 'email' | 'company_name' | 'pipedrive_org_id';

export interface LeadContact {
  name: string;
  email: string;
  phone?: string;
  company: string;
  num_locations?: number;
  concept_type?: string;
  pos?: string;
  campaign?: string;
  cargo?: string;
  linkedin_url?: string;
}

export interface LeadIntakeRequest {
  source: LeadSource;
  campaign?: string;
  contacts: LeadContact[];
}

export interface NormalizedLead {
  name: string;
  email: string;
  domain: string;
  phone?: string;
  company: string;
  company_normalized: string;
  num_locations?: number;
  concept_type?: string;
  pos?: string;
  cargo?: string;
  linkedin_url?: string;
}

export interface DedupResult {
  person_found: boolean;
  pipedrive_person_id?: number;
  org_found: boolean;
  pipedrive_org_id?: number;
  org_match_type?: 'domain' | 'name';
  has_open_deal: boolean;
  pipedrive_deal_id?: number;
  status: LeadStatus;
}

export interface LeadRecord {
  id: string;
  raw_payload: LeadContact;
  normalized: NormalizedLead | null;
  source: LeadSource;
  campaign: string | null;
  status: LeadStatus;
  rejection_reason: string | null;
  dedup_result: DedupResult | null;
  pipedrive_person_id: number | null;
  pipedrive_org_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface ApprovalRecord {
  id: string;
  type: ApprovalType;
  agent_name: string;
  summary: string;
  payload_before: unknown | null;
  payload_after: unknown;
  status: ApprovalStatus;
  priority: ApprovalPriority;
  requested_at: string;
  decided_by: string | null;
  decided_at: string | null;
  notes: string | null;
  slack_message_ts: string | null;
  execution_result: unknown | null;
  linked_lead_id: string | null;
  action_type: string | null;
}

export interface AgentLogRecord {
  id: string;
  timestamp: string;
  level: string;
  agent_name: string;
  action: string;
  details: unknown;
  duration_ms: number | null;
  cost_cents: number | null;
}

export interface BlacklistMatch {
  blocked: boolean;
  type?: BlacklistType;
  value?: string;
  reason?: string;
}
