import { query } from '../lib/db';
import { BlacklistMatch } from '../types';

interface BlacklistRow {
  type: string;
  value: string;
  reason: string | null;
}

export async function checkBlacklist(
  email?: string,
  domain?: string,
  company?: string
): Promise<BlacklistMatch> {
  const conditions: string[] = [];
  const params: string[] = [];

  if (email) {
    params.push(email.toLowerCase());
    conditions.push(`(type = 'email' AND LOWER(value) = $${params.length})`);
  }

  if (domain) {
    params.push(domain.toLowerCase());
    conditions.push(`(type = 'domain' AND LOWER(value) = $${params.length})`);
  }

  if (company) {
    params.push(company.toLowerCase());
    conditions.push(`(type = 'company_name' AND LOWER(value) = $${params.length})`);
  }

  if (conditions.length === 0) {
    return { blocked: false };
  }

  const sql = `SELECT type, value, reason FROM blacklist WHERE ${conditions.join(' OR ')} LIMIT 1`;
  const rows = await query<BlacklistRow>(sql, params);

  if (rows.length === 0) {
    return { blocked: false };
  }

  return {
    blocked: true,
    type: rows[0].type as BlacklistMatch['type'],
    value: rows[0].value,
    reason: rows[0].reason ?? undefined,
  };
}

export async function addToBlacklist(
  type: string,
  value: string,
  reason?: string
): Promise<void> {
  await query(
    `INSERT INTO blacklist (type, value, reason) VALUES ($1, $2, $3) ON CONFLICT (type, value) DO NOTHING`,
    [type, value.toLowerCase(), reason ?? null]
  );
}
