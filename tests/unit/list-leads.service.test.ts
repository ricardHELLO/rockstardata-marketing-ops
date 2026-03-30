import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/lib/db', () => ({
  query: vi.fn(),
  queryOne: vi.fn(),
  pool: { query: vi.fn() },
}));

import { query } from '../../src/lib/db';
import { listLeads } from '../../src/services/leads.service';

const mockQuery = vi.mocked(query);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('listLeads — query building', () => {
  it('no filters: runs query without WHERE clause', async () => {
    mockQuery.mockResolvedValueOnce([]);

    await listLeads();

    expect(mockQuery).toHaveBeenCalledOnce();
    const [sql, params] = mockQuery.mock.calls[0];
    expect(sql).not.toContain('WHERE');
    expect(sql).toContain('ORDER BY created_at DESC');
    // Default limit=50, offset=0
    expect(params).toEqual([50, 0]);
  });

  it('status filter: adds WHERE status = $1', async () => {
    mockQuery.mockResolvedValueOnce([]);

    await listLeads('net_new');

    const [sql, params] = mockQuery.mock.calls[0];
    expect(sql).toContain('WHERE');
    expect(sql).toContain('status = $1');
    expect(params).toEqual(['net_new', 50, 0]);
  });

  it('campaign filter: adds WHERE campaign = $1', async () => {
    mockQuery.mockResolvedValueOnce([]);

    await listLeads(undefined, 'QSR_MADRID_ABR26');

    const [sql, params] = mockQuery.mock.calls[0];
    expect(sql).toContain('WHERE');
    expect(sql).toContain('campaign = $1');
    expect(params).toEqual(['QSR_MADRID_ABR26', 50, 0]);
  });

  it('both filters: joins conditions with AND', async () => {
    mockQuery.mockResolvedValueOnce([]);

    await listLeads('in_crm', 'QSR_MADRID_ABR26');

    const [sql, params] = mockQuery.mock.calls[0];
    expect(sql).toContain('status = $1');
    expect(sql).toContain('AND');
    expect(sql).toContain('campaign = $2');
    expect(params).toEqual(['in_crm', 'QSR_MADRID_ABR26', 50, 0]);
  });

  it('custom limit and offset are forwarded to query', async () => {
    mockQuery.mockResolvedValueOnce([]);

    await listLeads(undefined, undefined, 10, 30);

    const [, params] = mockQuery.mock.calls[0];
    expect(params).toContain(10);
    expect(params).toContain(30);
  });

  it('returns the array of leads from the DB', async () => {
    const fakeLeads = [
      { id: 'aaa', status: 'net_new', email: 'a@b.com' },
      { id: 'bbb', status: 'in_crm',  email: 'c@d.com' },
    ];
    mockQuery.mockResolvedValueOnce(fakeLeads as never);

    const result = await listLeads();

    expect(result).toEqual(fakeLeads);
  });
});
