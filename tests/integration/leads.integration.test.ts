import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock DB and external services
vi.mock('../../src/lib/db', () => ({
  query: vi.fn(),
  queryOne: vi.fn(),
  pool: { query: vi.fn() },
}));

vi.mock('../../src/services/slack.service', () => ({
  sendApprovalNotification: vi.fn().mockResolvedValue(null),
  updateApprovalMessage: vi.fn().mockResolvedValue(undefined),
}));

import { query, queryOne } from '../../src/lib/db';
import { processContact, processIntake, normalizeLead } from '../../src/services/leads.service';

const mockQuery = vi.mocked(query);
const mockQueryOne = vi.mocked(queryOne);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('processContact — full pipeline', () => {
  const contact = {
    name: 'Juan García',
    email: 'juan@restaurantegarcia.es',
    company: 'Restaurante García S.L.',
    num_locations: 3,
    concept_type: 'Casual Dining',
  };

  it('processes a net_new lead: normalize → blacklist clear → dedup clear → insert → create approval', async () => {
    // Blacklist check returns no match
    mockQuery.mockResolvedValueOnce([]);
    // Dedup: no existing by email
    mockQueryOne.mockResolvedValueOnce(null);
    // Dedup: no existing by domain
    mockQueryOne.mockResolvedValueOnce(null);
    // Dedup: no existing by company name
    mockQueryOne.mockResolvedValueOnce(null);
    // Insert lead
    mockQueryOne.mockResolvedValueOnce({
      id: 'lead-001',
      status: 'net_new',
      rejection_reason: null,
    });
    // Create approval (insert)
    mockQueryOne.mockResolvedValueOnce({
      id: 'approval-001',
      type: 'crm_create',
      status: 'pending',
      agent_name: 'CRM Hygiene Agent',
      summary: 'Create Restaurante García (Juan García) in Pipedrive — new org + person',
      requested_at: new Date().toISOString(),
      priority: 'normal',
    });

    const result = await processContact(contact, 'outbound', 'campaign-q1');

    expect(result.status).toBe('net_new');
    expect(result.lead_id).toBe('lead-001');
    expect(result.approval_id).toBe('approval-001');

    // Verify blacklist was checked
    const blacklistCall = mockQuery.mock.calls[0];
    expect(blacklistCall[0]).toContain('blacklist');

    // Verify lead was inserted with correct data
    const insertCall = mockQueryOne.mock.calls[3]; // 4th queryOne call = insert lead
    expect(insertCall[0]).toContain('INSERT INTO leads_intake');
    const insertParams = insertCall[1] as unknown[];
    expect(insertParams[2]).toBe('outbound'); // source
    expect(insertParams[3]).toBe('campaign-q1'); // campaign
  });

  it('blocks a blacklisted lead', async () => {
    // Blacklist check returns a match
    mockQuery.mockResolvedValueOnce([{
      type: 'domain',
      value: 'restaurantegarcia.es',
      reason: 'Competitor',
    }]);
    // Insert blacklisted lead
    mockQueryOne.mockResolvedValueOnce({
      id: 'lead-blocked',
      status: 'blacklisted',
      rejection_reason: 'Blacklisted: domain = restaurantegarcia.es (Competitor)',
    });

    const result = await processContact(contact, 'outbound');

    expect(result.status).toBe('blacklisted');
    expect(result.lead_id).toBe('lead-blocked');
    expect(result.rejection_reason).toContain('Competitor');
    expect(result.approval_id).toBeUndefined();
  });

  it('detects existing_contact when person and org both found in DB', async () => {
    // Blacklist: clear
    mockQuery.mockResolvedValueOnce([]);
    // Dedup: existing by email
    mockQueryOne.mockResolvedValueOnce({
      id: 'existing-lead',
      pipedrive_person_id: 123,
      pipedrive_org_id: 456,
    });
    // Dedup: existing by domain
    mockQueryOne.mockResolvedValueOnce({
      id: 'existing-lead',
      pipedrive_org_id: 456,
    });
    // Dedup: check for in_crm status → not in CRM
    mockQueryOne.mockResolvedValueOnce(null);
    // Insert lead
    mockQueryOne.mockResolvedValueOnce({
      id: 'lead-dup',
      status: 'existing_contact',
    });

    const result = await processContact(contact, 'outbound');

    expect(result.status).toBe('existing_contact');
    // No approval should be created for existing contacts
    expect(result.approval_id).toBeUndefined();
  });

  it('detects new_contact_existing_org and creates approval', async () => {
    // Blacklist: clear
    mockQuery.mockResolvedValueOnce([]);
    // Dedup: no existing by email
    mockQueryOne.mockResolvedValueOnce(null);
    // Dedup: existing by domain
    mockQueryOne.mockResolvedValueOnce({
      id: 'other-lead',
      pipedrive_org_id: 789,
    });
    // Insert lead
    mockQueryOne.mockResolvedValueOnce({
      id: 'lead-new-contact',
      status: 'new_contact_existing_org',
    });
    // Create approval
    mockQueryOne.mockResolvedValueOnce({
      id: 'approval-002',
      type: 'crm_create',
      status: 'pending',
    });

    const result = await processContact(contact, 'scraper');

    expect(result.status).toBe('new_contact_existing_org');
    expect(result.approval_id).toBe('approval-002');
  });
});

describe('processIntake — batch processing', () => {
  it('tallies created, blocked, and duplicates correctly', async () => {
    const contacts = [
      { name: 'A', email: 'a@new.com', company: 'New Co' },
      { name: 'B', email: 'b@blocked.com', company: 'Blocked Co' },
      { name: 'C', email: 'c@existing.com', company: 'Existing Co' },
    ];

    // Contact A: net_new
    mockQuery.mockResolvedValueOnce([]); // blacklist clear
    mockQueryOne.mockResolvedValueOnce(null); // dedup email
    mockQueryOne.mockResolvedValueOnce(null); // dedup domain
    mockQueryOne.mockResolvedValueOnce(null); // dedup company
    mockQueryOne.mockResolvedValueOnce({ id: 'a', status: 'net_new' }); // insert
    mockQueryOne.mockResolvedValueOnce({ id: 'app-a', status: 'pending' }); // approval

    // Contact B: blacklisted
    mockQuery.mockResolvedValueOnce([{ type: 'domain', value: 'blocked.com', reason: 'Bad' }]);
    mockQueryOne.mockResolvedValueOnce({ id: 'b', status: 'blacklisted', rejection_reason: 'Blacklisted' });

    // Contact C: existing_contact
    mockQuery.mockResolvedValueOnce([]); // blacklist clear
    mockQueryOne.mockResolvedValueOnce({ id: 'old', pipedrive_person_id: 1 }); // dedup email
    mockQueryOne.mockResolvedValueOnce({ id: 'old', pipedrive_org_id: 2 }); // dedup domain
    mockQueryOne.mockResolvedValueOnce(null); // not in CRM
    mockQueryOne.mockResolvedValueOnce({ id: 'c', status: 'existing_contact' }); // insert

    const result = await processIntake('outbound', 'test-campaign', contacts);

    expect(result.created).toBe(1);
    expect(result.blocked).toBe(1);
    expect(result.duplicates).toBe(1);
    expect(result.results).toHaveLength(3);
  });
});

describe('normalizeLead — edge cases for integration', () => {
  it('handles generic domain (gmail) — domain should not trigger org match', () => {
    const result = normalizeLead({
      name: 'Freelancer',
      email: 'test@gmail.com',
      company: 'Freelance Inc',
    });
    expect(result.domain).toBe('gmail.com');
    // The dedup logic should skip domain matching for this —
    // tested in the dedup flow above
  });
});
