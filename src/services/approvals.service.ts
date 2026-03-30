import { query, queryOne } from '../lib/db';
import { logger } from '../lib/logger';
import { AppError } from '../lib/errors';
import { ApprovalRecord, ApprovalStatus } from '../types';
import { ValidatedCreateApproval, ValidatedUpdateApproval } from '../validators/approvals.validator';
import { createLeadInPipedrive } from './pipedrive.service';
import { sendApprovalNotification, updateApprovalMessage } from './slack.service';
import { config } from '../config';

export async function createApproval(input: ValidatedCreateApproval): Promise<ApprovalRecord> {
  const row = await queryOne<ApprovalRecord>(
    `INSERT INTO approvals (type, agent_name, summary, payload_before, payload_after, priority, linked_lead_id, action_type)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      input.type,
      input.agent_name,
      input.summary,
      input.payload_before ? JSON.stringify(input.payload_before) : null,
      JSON.stringify(input.payload_after),
      input.priority,
      input.linked_lead_id ?? null,
      input.action_type ?? null,
    ]
  );

  logger.info({ approval_id: row!.id, type: input.type }, 'Approval created');

  // Send Slack notification (non-blocking — don't fail the approval creation)
  try {
    const messageTs = await sendApprovalNotification(row!);
    if (messageTs) {
      await updateSlackMessageTs(row!.id, messageTs);
    }
  } catch (err) {
    logger.warn({ err, approval_id: row!.id }, 'Failed to send Slack notification for new approval');
  }

  return row!;
}

export async function listApprovals(
  status?: ApprovalStatus,
  limit = 50,
  offset = 0
): Promise<ApprovalRecord[]> {
  if (status) {
    return query<ApprovalRecord>(
      'SELECT * FROM approvals WHERE status = $1 ORDER BY requested_at DESC LIMIT $2 OFFSET $3',
      [status, limit, offset]
    );
  }
  return query<ApprovalRecord>(
    'SELECT * FROM approvals ORDER BY requested_at DESC LIMIT $1 OFFSET $2',
    [limit, offset]
  );
}

export async function getApprovalById(id: string): Promise<ApprovalRecord> {
  const row = await queryOne<ApprovalRecord>('SELECT * FROM approvals WHERE id = $1', [id]);
  if (!row) {
    throw AppError.notFound('APPROVAL_NOT_FOUND', `Approval ${id} not found`);
  }
  return row;
}

export async function updateApprovalDecision(
  id: string,
  input: ValidatedUpdateApproval
): Promise<ApprovalRecord> {
  const existing = await getApprovalById(id);

  if (existing.status !== 'pending') {
    throw AppError.conflict(
      'APPROVAL_ALREADY_DECIDED',
      `Approval ${id} is already ${existing.status}`
    );
  }

  const row = await queryOne<ApprovalRecord>(
    `UPDATE approvals
     SET status = $1, decided_by = $2, decided_at = NOW(), notes = $3
     WHERE id = $4
     RETURNING *`,
    [input.status, input.decided_by, input.notes ?? null, id]
  );

  logger.info(
    { approval_id: id, status: input.status, decided_by: input.decided_by },
    'Approval decision recorded'
  );

  // If approved, execute the pending action
  if (input.status === 'approved' && row!.action_type) {
    await executeApprovedAction(row!);
  }

  // Update Slack message after decision
  try {
    if (row!.slack_message_ts && config.slack.approvalChannel) {
      await updateApprovalMessage(config.slack.approvalChannel, row!.slack_message_ts, row!);
    }
  } catch (err) {
    logger.warn({ err, approval_id: id }, 'Failed to update Slack message after decision');
  }

  return row!;
}

async function executeApprovedAction(approval: ApprovalRecord): Promise<void> {
  try {
    switch (approval.action_type) {
      case 'create_in_pipedrive': {
        const outer = approval.payload_after as Record<string, unknown>;
        // payload_after is { normalized: {...}, dedup_result: {...} } when coming from leads.service
        // or a flat object when created directly via the API
        const payload = (outer.normalized as Record<string, unknown>) ?? outer;
        const dedupResult = (outer.dedup_result as Record<string, unknown>) ?? {};

        if (!config.pipedrive.apiToken) {
          logger.info({ approval_id: approval.id }, 'Pipedrive not configured — skipping execution, marking as executed');
          await query(
            `UPDATE approvals SET execution_result = $1 WHERE id = $2`,
            [JSON.stringify({ executed: false, reason: 'pipedrive_not_configured' }), approval.id]
          );
          return;
        }

        const result = await createLeadInPipedrive({
          name: String(payload.name || ''),
          email: String(payload.email || ''),
          company: String(payload.company || ''),
          phone: payload.phone ? String(payload.phone) : undefined,
          source: payload.source ? String(payload.source) : undefined,
          campaign: payload.campaign ? String(payload.campaign) : undefined,
          num_locations: payload.num_locations as number | undefined,
          concept_type: payload.concept_type ? String(payload.concept_type) : undefined,
          pos: payload.pos ? String(payload.pos) : undefined,
          cargo: payload.cargo ? String(payload.cargo) : undefined,
          linkedin_url: payload.linkedin_url ? String(payload.linkedin_url) : undefined,
          existing_org_id: (dedupResult.pipedrive_org_id as number) ?? undefined,
        });

        // Update linked lead with Pipedrive IDs
        if (approval.linked_lead_id) {
          await query(
            `UPDATE leads_intake
             SET status = 'in_crm',
                 pipedrive_person_id = $1,
                 pipedrive_org_id = $2,
                 updated_at = NOW()
             WHERE id = $3`,
            [result.person_id, result.org_id, approval.linked_lead_id]
          );
        }

        await query(
          `UPDATE approvals SET execution_result = $1 WHERE id = $2`,
          [JSON.stringify({ executed: true, ...result, timestamp: new Date().toISOString() }), approval.id]
        );

        logger.info({ approval_id: approval.id, ...result }, 'Pipedrive creation executed');
        break;
      }
      default:
        logger.warn({ approval_id: approval.id, action_type: approval.action_type }, 'Unknown action type');
    }
  } catch (err) {
    logger.error({ err, approval_id: approval.id }, 'Failed to execute approved action');
    await query(
      `UPDATE approvals SET execution_result = $1 WHERE id = $2`,
      [JSON.stringify({ executed: false, error: String(err) }), approval.id]
    );
  }
}

export async function updateSlackMessageTs(id: string, messageTs: string): Promise<void> {
  await query('UPDATE approvals SET slack_message_ts = $1 WHERE id = $2', [messageTs, id]);
}
