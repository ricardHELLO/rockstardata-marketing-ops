import { Router, Request, Response } from 'express';
import express from 'express';
import { asyncHandler, AppError } from '../lib/errors';
import { logger } from '../lib/logger';
import { sendApprovalNotification, verifyAndParseWebhook, updateApprovalMessage } from '../services/slack.service';
import { getApprovalById, updateApprovalDecision } from '../services/approvals.service';
import { config } from '../config';

const router = Router();

// POST /api/slack/notify — send approval notification to Slack
router.post(
  '/slack/notify',
  asyncHandler(async (req, res) => {
    const { approval_id } = req.body;
    if (!approval_id) {
      throw AppError.badRequest('MISSING_PARAM', 'approval_id is required');
    }

    const approval = await getApprovalById(approval_id);
    const messageTs = await sendApprovalNotification(approval);

    if (messageTs) {
      // Store message_ts for later updates
      const { updateSlackMessageTs } = await import('../services/approvals.service');
      await updateSlackMessageTs(approval_id, messageTs);
    }

    res.json({ ok: true, data: { sent: !!messageTs, message_ts: messageTs } });
  })
);

// POST /api/slack/webhook — receive interactive button clicks from Slack
// This endpoint needs raw body for signature verification
router.post(
  '/slack/webhook',
  express.urlencoded({ extended: false }),
  asyncHandler(async (req: Request, res: Response) => {
    // Reconstruct raw body from parsed payload
    const rawBody = typeof req.body === 'string'
      ? req.body
      : `payload=${encodeURIComponent(typeof req.body.payload === 'string' ? req.body.payload : JSON.stringify(req.body))}`;

    const result = verifyAndParseWebhook(rawBody, {
      'x-slack-signature': req.headers['x-slack-signature'] as string,
      'x-slack-request-timestamp': req.headers['x-slack-request-timestamp'] as string,
    });

    if (!result.verified) {
      logger.warn('Slack webhook signature verification failed');
      throw AppError.unauthorized('Slack signature verification failed');
    }

    const payload = result.payload as {
      type: string;
      actions?: { action_id: string; value: string }[];
      user?: { id: string; username: string };
    };

    // Handle Slack URL verification challenge
    if (payload.type === 'url_verification') {
      res.json({ challenge: (payload as unknown as { challenge: string }).challenge });
      return;
    }

    // Handle interactive button clicks
    if (payload.type === 'block_actions' && payload.actions?.length) {
      const action = payload.actions[0];
      const approvalId = action.value;
      const decision = action.action_id === 'approve' ? 'approved' : 'rejected';
      const decidedBy = payload.user?.username || 'slack_user';

      logger.info({ approval_id: approvalId, decision, decided_by: decidedBy }, 'Slack approval action');

      const updated = await updateApprovalDecision(approvalId, {
        status: decision as 'approved' | 'rejected',
        decided_by: decidedBy,
        notes: `Via Slack by @${decidedBy}`,
      });

      // Update the original Slack message
      if (updated.slack_message_ts && config.slack.approvalChannel) {
        await updateApprovalMessage(
          config.slack.approvalChannel,
          updated.slack_message_ts,
          updated
        );
      }

      // Slack expects 200 OK within 3 seconds
      res.json({ ok: true });
      return;
    }

    res.json({ ok: true });
  })
);

export default router;
