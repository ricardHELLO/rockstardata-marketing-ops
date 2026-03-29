import { query, queryOne } from '../lib/db';
import { AgentLogRecord } from '../types';

interface CreateLogInput {
  level: string;
  agent_name: string;
  action: string;
  details?: unknown;
  duration_ms?: number;
  cost_cents?: number;
}

export async function createLog(input: CreateLogInput): Promise<AgentLogRecord> {
  const row = await queryOne<AgentLogRecord>(
    `INSERT INTO agent_logs (level, agent_name, action, details, duration_ms, cost_cents)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      input.level,
      input.agent_name,
      input.action,
      input.details ? JSON.stringify(input.details) : null,
      input.duration_ms ?? null,
      input.cost_cents ?? null,
    ]
  );
  return row!;
}

interface LogFilters {
  agent_name?: string;
  level?: string;
  action?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}

export async function listLogs(filters: LogFilters): Promise<AgentLogRecord[]> {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (filters.agent_name) {
    params.push(filters.agent_name);
    conditions.push(`agent_name = $${params.length}`);
  }

  if (filters.level) {
    params.push(filters.level);
    conditions.push(`level = $${params.length}`);
  }

  if (filters.action) {
    params.push(filters.action);
    conditions.push(`action = $${params.length}`);
  }

  if (filters.from) {
    params.push(filters.from);
    conditions.push(`timestamp >= $${params.length}`);
  }

  if (filters.to) {
    params.push(filters.to);
    conditions.push(`timestamp <= $${params.length}`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit = filters.limit ?? 100;
  const offset = filters.offset ?? 0;

  params.push(limit, offset);

  return query<AgentLogRecord>(
    `SELECT * FROM agent_logs ${where} ORDER BY timestamp DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );
}
