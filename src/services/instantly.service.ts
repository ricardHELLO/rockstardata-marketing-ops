import { query, queryOne } from '../lib/db';
import { logger } from '../lib/logger';

// Instantly integration is a V1 stub. Instead of calling the Instantly API,
// we store the draft payload in the agent_logs table for later retrieval.
// When the Instantly integration is activated in V2, this service will
// call the Instantly API to create campaigns and add leads.

export interface InstantlyDraft {
  campaign_name: string;
  from_email?: string;
  subject: string;
  body_html: string;
  recipients: { email: string; name?: string; company?: string }[];
  schedule_at?: string;
}

export async function storeDraft(
  agentName: string,
  draft: InstantlyDraft
): Promise<{ log_id: string }> {
  const row = await queryOne<{ id: string }>(
    `INSERT INTO agent_logs (level, agent_name, action, details)
     VALUES ('info', $1, 'instantly_draft_stored', $2)
     RETURNING id`,
    [agentName, JSON.stringify(draft)]
  );

  logger.info(
    { log_id: row!.id, campaign: draft.campaign_name, recipients: draft.recipients.length },
    'Instantly draft stored (stub)'
  );

  return { log_id: row!.id };
}

export async function listDrafts(limit = 20): Promise<unknown[]> {
  const rows = await query(
    `SELECT id, agent_name, details, timestamp
     FROM agent_logs
     WHERE action = 'instantly_draft_stored'
     ORDER BY timestamp DESC
     LIMIT $1`,
    [limit]
  );
  return rows;
}
