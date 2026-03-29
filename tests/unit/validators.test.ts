import { describe, it, expect } from 'vitest';
import { leadIntakeSchema } from '../../src/validators/leads.validator';
import { createApprovalSchema, updateApprovalSchema } from '../../src/validators/approvals.validator';
import { createLogSchema } from '../../src/validators/logs.validator';

describe('leadIntakeSchema', () => {
  const validPayload = {
    source: 'outbound',
    contacts: [
      { name: 'Juan', email: 'juan@restaurante.es', company: 'Restaurante García' },
    ],
  };

  it('accepts a valid payload', () => {
    const result = leadIntakeSchema.parse(validPayload);
    expect(result.source).toBe('outbound');
    expect(result.contacts).toHaveLength(1);
    expect(result.contacts[0].email).toBe('juan@restaurante.es');
  });

  it('lowercases email', () => {
    const result = leadIntakeSchema.parse({
      ...validPayload,
      contacts: [{ name: 'A', email: 'UPPER@TEST.COM', company: 'B' }],
    });
    expect(result.contacts[0].email).toBe('upper@test.com');
  });

  it('rejects invalid source', () => {
    expect(() =>
      leadIntakeSchema.parse({ ...validPayload, source: 'invalid_source' })
    ).toThrow();
  });

  it('rejects empty contacts array', () => {
    expect(() =>
      leadIntakeSchema.parse({ source: 'outbound', contacts: [] })
    ).toThrow();
  });

  it('rejects contacts without email', () => {
    expect(() =>
      leadIntakeSchema.parse({
        source: 'outbound',
        contacts: [{ name: 'A', company: 'B' }],
      })
    ).toThrow();
  });

  it('rejects invalid email format', () => {
    expect(() =>
      leadIntakeSchema.parse({
        source: 'outbound',
        contacts: [{ name: 'A', email: 'not-an-email', company: 'B' }],
      })
    ).toThrow();
  });

  it('accepts all valid sources', () => {
    const sources = ['outbound', 'inbound_form', 'scraper', 'import', 'webhook'];
    for (const source of sources) {
      const result = leadIntakeSchema.parse({ ...validPayload, source });
      expect(result.source).toBe(source);
    }
  });

  it('accepts optional fields on contacts', () => {
    const result = leadIntakeSchema.parse({
      source: 'outbound',
      contacts: [{
        name: 'Test',
        email: 'test@company.com',
        company: 'Acme',
        num_locations: 10,
        concept_type: 'Fast Casual',
        pos: 'Toast',
        cargo: 'Director',
        linkedin_url: 'https://linkedin.com/in/test',
      }],
    });
    expect(result.contacts[0].num_locations).toBe(10);
  });

  it('rejects more than 100 contacts', () => {
    const contacts = Array.from({ length: 101 }, (_, i) => ({
      name: `Person ${i}`,
      email: `p${i}@test.com`,
      company: 'Bulk Co',
    }));
    expect(() =>
      leadIntakeSchema.parse({ source: 'import', contacts })
    ).toThrow();
  });
});

describe('createApprovalSchema', () => {
  it('accepts a valid approval', () => {
    const result = createApprovalSchema.parse({
      type: 'crm_create',
      agent_name: 'CRM Agent',
      summary: 'Create org in Pipedrive',
      payload_after: { name: 'Test' },
    });
    expect(result.type).toBe('crm_create');
    expect(result.priority).toBe('normal'); // default
  });

  it('rejects unknown approval type', () => {
    expect(() =>
      createApprovalSchema.parse({
        type: 'unknown_type',
        agent_name: 'Agent',
        summary: 'Test',
        payload_after: {},
      })
    ).toThrow();
  });

  it('accepts all valid types', () => {
    const types = [
      'content_linkedin', 'content_newsletter', 'outbound_email',
      'crm_create', 'crm_create_bulk', 'crm_stage_change', 'instantly_draft',
    ];
    for (const type of types) {
      const result = createApprovalSchema.parse({
        type,
        agent_name: 'Agent',
        summary: 'Test',
        payload_after: {},
      });
      expect(result.type).toBe(type);
    }
  });
});

describe('updateApprovalSchema', () => {
  it('accepts approved with decided_by', () => {
    const result = updateApprovalSchema.parse({
      status: 'approved',
      decided_by: 'ricard',
    });
    expect(result.status).toBe('approved');
    expect(result.decided_by).toBe('ricard');
  });

  it('defaults decided_by to ricard', () => {
    const result = updateApprovalSchema.parse({ status: 'rejected' });
    expect(result.decided_by).toBe('ricard');
  });

  it('rejects invalid status', () => {
    expect(() =>
      updateApprovalSchema.parse({ status: 'pending' })
    ).toThrow();
  });
});

describe('createLogSchema', () => {
  it('accepts a valid log entry', () => {
    const result = createLogSchema.parse({
      level: 'info',
      agent_name: 'Content Agent',
      action: 'generated_post',
      details: { topic: 'HORECA trends' },
    });
    expect(result.level).toBe('info');
    expect(result.agent_name).toBe('Content Agent');
  });

  it('accepts optional duration and cost', () => {
    const result = createLogSchema.parse({
      level: 'info',
      agent_name: 'Agent',
      action: 'test',
      duration_ms: 1500,
      cost_cents: 3,
    });
    expect(result.duration_ms).toBe(1500);
    expect(result.cost_cents).toBe(3);
  });
});
