import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock DB
vi.mock('../../src/lib/db', () => ({
  query: vi.fn(),
  queryOne: vi.fn(),
  pool: { query: vi.fn() },
}));

// Mock external services
vi.mock('../../src/services/pipedrive.service', () => ({
  createLeadInPipedrive: vi.fn(),
}));

vi.mock('../../src/services/slack.service', () => ({
  sendApprovalNotification: vi.fn().mockResolvedValue('mock-ts'),
  updateApprovalMessage: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../../src/config', () => ({
  config: {
    logLevel: 'silent',
    isDev: false,
    pipedrive: {
      apiToken: 'test-token',
      ownerId: 1,
      pipelineId: 1,
      baseUrl: 'https://api.pipedrive.com/v1',
      fields: {},
    },
    slack: {
      botToken: '',
      signingSecret: '',
      approvalChannel: '',
    },
  },
}));

import { query, queryOne } from '../../src/lib/db';
import { createLeadInPipedrive } from '../../src/services/pipedrive.service';
import { sendApprovalNotification } from '../../src/services/slack.service';
import {
  createApproval,
  listApprovals,
  getApprovalById,
  updateApprovalDecision,
} from '../../src/services/approvals.service';

const mockQuery = vi.mocked(query);
const mockQueryOne = vi.mocked(queryOne);
const mockCreateInPipedrive = vi.mocked(createLeadInPipedrive);
const mockSlackNotify = vi.mocked(sendApprovalNotification);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('createApproval', () => {
  it('inserts an approval and sends Slack notification', async () => {
    const mockApproval = {
      id: 'appr-001',
      type: 'crm_create',
      agent_name: 'CRM Agent',
      summary: 'Create in Pipedrive',
      status: 'pending',
      priority: 'normal',
      requested_at: new Date().toISOString(),
      payload_after: { name: 'Test' },
      slack_message_ts: null,
    };

    mockQueryOne.mockResolvedValueOnce(mockApproval);
    // updateSlackMessageTs call
    mockQuery.mockResolvedValueOnce([]);

    const result = await createApproval({
      type: 'crm_create',
      agent_name: 'CRM Agent',
      summary: 'Create in Pipedrive',
      payload_after: { name: 'Test' },
      priority: 'normal',
    });

    expect(result.id).toBe('appr-001');
    expect(result.status).toBe('pending');
    expect(mockSlackNotify).toHaveBeenCalledWith(mockApproval);
  });
});

describe('listApprovals', () => {
  it('queries with status filter', async () => {
    mockQuery.mockResolvedValueOnce([
      { id: '1', status: 'pending' },
      { id: '2', status: 'pending' },
    ]);

    const result = await listApprovals('pending', 10, 0);

    expect(result).toHaveLength(2);
    const [sql, params] = mockQuery.mock.calls[0];
    expect(sql).toContain('status = $1');
    expect(params).toEqual(['pending', 10, 0]);
  });

  it('queries without filter when no status provided', async () => {
    mockQuery.mockResolvedValueOnce([]);
    await listApprovals(undefined, 50, 0);

    const [sql] = mockQuery.mock.calls[0];
    expect(sql).not.toContain('WHERE');
  });
});

describe('getApprovalById', () => {
  it('returns the approval when found', async () => {
    mockQueryOne.mockResolvedValueOnce({ id: 'appr-001', status: 'pending' });
    const result = await getApprovalById('appr-001');
    expect(result.id).toBe('appr-001');
  });

  it('throws 404 when not found', async () => {
    mockQueryOne.mockResolvedValueOnce(null);
    await expect(getApprovalById('nonexistent')).rejects.toThrow('not found');
  });
});

describe('updateApprovalDecision', () => {
  it('approves and executes Pipedrive creation when action_type is create_in_pipedrive', async () => {
    // getApprovalById
    mockQueryOne.mockResolvedValueOnce({
      id: 'appr-001',
      status: 'pending',
      action_type: 'create_in_pipedrive',
      linked_lead_id: 'lead-001',
      payload_after: {
        name: 'Juan',
        email: 'juan@test.com',
        company: 'Test Corp',
      },
      slack_message_ts: 'ts-123',
    });
    // UPDATE approvals SET status = ...
    mockQueryOne.mockResolvedValueOnce({
      id: 'appr-001',
      status: 'approved',
      action_type: 'create_in_pipedrive',
      linked_lead_id: 'lead-001',
      payload_after: {
        name: 'Juan',
        email: 'juan@test.com',
        company: 'Test Corp',
      },
      slack_message_ts: 'ts-123',
      decided_by: 'ricard',
    });
    // Pipedrive creation succeeds
    mockCreateInPipedrive.mockResolvedValueOnce({
      org_id: 100,
      person_id: 200,
      deal_id: 300,
    });
    // UPDATE leads_intake SET status = 'in_crm'
    mockQuery.mockResolvedValueOnce([]);
    // UPDATE approvals SET execution_result
    mockQuery.mockResolvedValueOnce([]);

    const result = await updateApprovalDecision('appr-001', {
      status: 'approved',
      decided_by: 'ricard',
    });

    expect(result.status).toBe('approved');
    expect(mockCreateInPipedrive).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Juan',
        email: 'juan@test.com',
        company: 'Test Corp',
      })
    );
  });

  it('rejects approval without executing any action', async () => {
    // getApprovalById
    mockQueryOne.mockResolvedValueOnce({
      id: 'appr-002',
      status: 'pending',
      action_type: 'create_in_pipedrive',
      slack_message_ts: null,
    });
    // UPDATE approvals
    mockQueryOne.mockResolvedValueOnce({
      id: 'appr-002',
      status: 'rejected',
      action_type: 'create_in_pipedrive',
      decided_by: 'ricard',
      notes: 'Not qualified',
      slack_message_ts: null,
    });

    const result = await updateApprovalDecision('appr-002', {
      status: 'rejected',
      decided_by: 'ricard',
      notes: 'Not qualified',
    });

    expect(result.status).toBe('rejected');
    expect(mockCreateInPipedrive).not.toHaveBeenCalled();
  });

  it('throws conflict when approval is already decided', async () => {
    mockQueryOne.mockResolvedValueOnce({
      id: 'appr-003',
      status: 'approved', // already decided
    });

    await expect(
      updateApprovalDecision('appr-003', { status: 'rejected', decided_by: 'ricard' })
    ).rejects.toThrow('already approved');
  });
});
