import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the db module before importing the service
vi.mock('../../src/lib/db', () => ({
  query: vi.fn(),
  queryOne: vi.fn(),
}));

import { query } from '../../src/lib/db';
import { checkBlacklist, addToBlacklist } from '../../src/services/blacklist.service';

const mockQuery = vi.mocked(query);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('checkBlacklist', () => {
  it('returns blocked: false when no match found', async () => {
    mockQuery.mockResolvedValue([]);
    const result = await checkBlacklist('test@company.com', 'company.com', 'Acme');
    expect(result.blocked).toBe(false);
  });

  it('returns blocked: true with match details when email matches', async () => {
    mockQuery.mockResolvedValue([{
      type: 'email',
      value: 'spam@bad.com',
      reason: 'Known spammer',
    }]);
    const result = await checkBlacklist('spam@bad.com');
    expect(result.blocked).toBe(true);
    expect(result.type).toBe('email');
    expect(result.value).toBe('spam@bad.com');
    expect(result.reason).toBe('Known spammer');
  });

  it('returns blocked: true when domain matches', async () => {
    mockQuery.mockResolvedValue([{
      type: 'domain',
      value: 'competitor.com',
      reason: 'Competitor',
    }]);
    const result = await checkBlacklist(undefined, 'competitor.com');
    expect(result.blocked).toBe(true);
    expect(result.type).toBe('domain');
  });

  it('returns blocked: true when company matches', async () => {
    mockQuery.mockResolvedValue([{
      type: 'company_name',
      value: 'banned corp',
      reason: null,
    }]);
    const result = await checkBlacklist(undefined, undefined, 'Banned Corp');
    expect(result.blocked).toBe(true);
    expect(result.type).toBe('company_name');
    expect(result.reason).toBeUndefined();
  });

  it('returns blocked: false when no criteria provided', async () => {
    const result = await checkBlacklist();
    expect(result.blocked).toBe(false);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('builds correct SQL with multiple criteria', async () => {
    mockQuery.mockResolvedValue([]);
    await checkBlacklist('test@company.com', 'company.com', 'Test Corp');

    expect(mockQuery).toHaveBeenCalledTimes(1);
    const [sql, params] = mockQuery.mock.calls[0];
    expect(sql).toContain("type = 'email'");
    expect(sql).toContain("type = 'domain'");
    expect(sql).toContain("type = 'company_name'");
    expect(params).toEqual(['test@company.com', 'company.com', 'test corp']);
  });

  it('lowercases all values for comparison', async () => {
    mockQuery.mockResolvedValue([]);
    await checkBlacklist('UPPER@EMAIL.COM', 'DOMAIN.COM', 'COMPANY NAME');

    const [, params] = mockQuery.mock.calls[0];
    expect(params).toEqual(['upper@email.com', 'domain.com', 'company name']);
  });
});

describe('addToBlacklist', () => {
  it('inserts with lowercase value', async () => {
    mockQuery.mockResolvedValue([]);
    await addToBlacklist('domain', 'Competitor.COM', 'Direct competitor');

    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO blacklist'),
      ['domain', 'competitor.com', 'Direct competitor']
    );
  });

  it('inserts with ON CONFLICT DO NOTHING', async () => {
    mockQuery.mockResolvedValue([]);
    await addToBlacklist('email', 'test@test.com');

    const [sql] = mockQuery.mock.calls[0];
    expect(sql).toContain('ON CONFLICT');
    expect(sql).toContain('DO NOTHING');
  });
});
