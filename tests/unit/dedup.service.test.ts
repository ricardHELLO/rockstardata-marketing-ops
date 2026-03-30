import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/lib/db', () => ({
  query: vi.fn(),
  queryOne: vi.fn(),
  pool: { query: vi.fn() },
}));

import { queryOne } from '../../src/lib/db';
import { dedupLead } from '../../src/services/leads.service';
import type { NormalizedLead, LeadRecord } from '../../src/types';

const mockQueryOne = vi.mocked(queryOne);

beforeEach(() => {
  vi.clearAllMocks();
});

// Helper — minimal NormalizedLead for tests
function makeNormalized(overrides: Partial<NormalizedLead> = {}): NormalizedLead {
  return {
    name: 'Juan García',
    email: 'juan@tragaluz.com',
    domain: 'tragaluz.com',
    company: 'Grupo Tragaluz',
    company_normalized: 'grupo tragaluz',
    ...overrides,
  };
}

// Helper — minimal LeadRecord stub
function makeLeadRow(overrides: Partial<LeadRecord> = {}): LeadRecord {
  return {
    id: 'aaaaaaaa-0000-0000-0000-000000000001',
    raw_payload: {},
    normalized: {} as never,
    source: 'outbound',
    campaign: null,
    status: 'net_new',
    rejection_reason: null,
    dedup_result: null,
    pipedrive_person_id: null,
    pipedrive_org_id: null,
    pipedrive_lead_id: null,
    pipedrive_deal_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  } as LeadRecord;
}

describe('dedupLead — status determination', () => {
  it('net_new: no person, no org by domain, no org by name', async () => {
    // email check → null, domain check → null, name check → null
    mockQueryOne
      .mockResolvedValueOnce(null) // email
      .mockResolvedValueOnce(null) // domain
      .mockResolvedValueOnce(null); // company name

    const result = await dedupLead(makeNormalized());

    expect(result.status).toBe('net_new');
    expect(result.person_found).toBe(false);
    expect(result.org_found).toBe(false);
    expect(result.has_open_deal).toBe(false);
  });

  it('existing_contact: person found, org found by domain, not in_crm', async () => {
    const personRow = makeLeadRow({ pipedrive_person_id: 42, pipedrive_org_id: 10 });
    const orgRow = makeLeadRow({ pipedrive_org_id: 10 });
    // email → found, domain → found, in_crm check → null
    mockQueryOne
      .mockResolvedValueOnce(personRow) // email
      .mockResolvedValueOnce(orgRow)    // domain
      .mockResolvedValueOnce(null);     // in_crm check

    const result = await dedupLead(makeNormalized());

    expect(result.status).toBe('existing_contact');
    expect(result.person_found).toBe(true);
    expect(result.org_found).toBe(true);
    expect(result.pipedrive_person_id).toBe(42);
    expect(result.pipedrive_org_id).toBe(10);
  });

  it('duplicate_with_deal: person found, org found by domain, in_crm record exists', async () => {
    const personRow = makeLeadRow({ pipedrive_person_id: 42, pipedrive_org_id: 10 });
    const orgRow = makeLeadRow({ pipedrive_org_id: 10 });
    const crmRow = makeLeadRow({ status: 'in_crm' });
    // email → found, domain → found, in_crm check → found
    mockQueryOne
      .mockResolvedValueOnce(personRow) // email
      .mockResolvedValueOnce(orgRow)    // domain
      .mockResolvedValueOnce(crmRow);   // in_crm check

    const result = await dedupLead(makeNormalized());

    expect(result.status).toBe('duplicate_with_deal');
    expect(result.person_found).toBe(true);
    expect(result.org_found).toBe(true);
  });

  it('new_contact_existing_org: no person, org found by domain', async () => {
    const orgRow = makeLeadRow({ pipedrive_org_id: 10 });
    // email → null, domain → found
    mockQueryOne
      .mockResolvedValueOnce(null)    // email
      .mockResolvedValueOnce(orgRow); // domain

    const result = await dedupLead(makeNormalized());

    expect(result.status).toBe('new_contact_existing_org');
    expect(result.person_found).toBe(false);
    expect(result.org_found).toBe(true);
    expect(result.org_match_type).toBe('domain');
    expect(result.pipedrive_org_id).toBe(10);
  });

  it('new_contact_existing_org: no person, no org by domain, org found by name', async () => {
    const orgRow = makeLeadRow({ pipedrive_org_id: 20 });
    // email → null, domain → null, company name → found
    mockQueryOne
      .mockResolvedValueOnce(null)    // email
      .mockResolvedValueOnce(null)    // domain
      .mockResolvedValueOnce(orgRow); // company name

    const result = await dedupLead(makeNormalized());

    expect(result.status).toBe('new_contact_existing_org');
    expect(result.org_match_type).toBe('name');
    expect(result.pipedrive_org_id).toBe(20);
  });

  it('orphan_contact: person found, no org by domain, no org by name', async () => {
    const personRow = makeLeadRow({ pipedrive_person_id: 99 });
    // email → found, domain → null, company name → null
    mockQueryOne
      .mockResolvedValueOnce(personRow) // email
      .mockResolvedValueOnce(null)      // domain
      .mockResolvedValueOnce(null);     // company name

    const result = await dedupLead(makeNormalized());

    expect(result.status).toBe('orphan_contact');
    expect(result.person_found).toBe(true);
    expect(result.org_found).toBe(false);
  });

  it('generic domain: skips domain query, falls through to company name check', async () => {
    // domain is gmail.com → domain query is skipped entirely
    // email → null, (no domain query), company name → null
    mockQueryOne
      .mockResolvedValueOnce(null) // email
      .mockResolvedValueOnce(null); // company name (domain skipped)

    const result = await dedupLead(
      makeNormalized({ email: 'juan@gmail.com', domain: 'gmail.com' })
    );

    expect(result.status).toBe('net_new');
    // Domain query must NOT have been called (only 2 queryOne calls total)
    expect(mockQueryOne).toHaveBeenCalledTimes(2);
    // First call checks email, second checks company name (domain skipped)
    expect(mockQueryOne.mock.calls[0][1]).toContain('juan@gmail.com');
    expect(mockQueryOne.mock.calls[1][1]).toContain('grupo tragaluz');
  });

  it('preserves pipedrive_org_id from domain match even when person also found', async () => {
    const personRow = makeLeadRow({ pipedrive_person_id: 5, pipedrive_org_id: null });
    const orgRow = makeLeadRow({ pipedrive_org_id: 77 });
    mockQueryOne
      .mockResolvedValueOnce(personRow) // email
      .mockResolvedValueOnce(orgRow)    // domain
      .mockResolvedValueOnce(null);     // in_crm check

    const result = await dedupLead(makeNormalized());

    // Domain match org_id should override the null from person row
    expect(result.pipedrive_org_id).toBe(77);
  });
});
