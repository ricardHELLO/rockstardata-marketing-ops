import crypto from 'crypto';
import axios from 'axios';
import { config } from '../config';
import { logger } from '../lib/logger';
import { ApprovalRecord } from '../types';

const SLACK_API = 'https://slack.com/api';

function ensureConfigured(): void {
  if (!config.slack.botToken) {
    throw new Error('SLACK_BOT_TOKEN is not configured');
  }
}

function headers() {
  return { Authorization: `Bearer ${config.slack.botToken}` };
}

// --- Webhook signature verification ---

export function verifySlackSignature(
  signingSecret: string,
  signature: string,
  timestamp: string,
  body: string
): boolean {
  // Reject requests older than 5 minutes (replay protection)
  const fiveMinutesAgo = Math.floor(Date.now() / 1000) - 300;
  if (parseInt(timestamp, 10) < fiveMinutesAgo) {
    return false;
  }

  const sigBasestring = `v0:${timestamp}:${body}`;
  const mySignature = 'v0=' + crypto
    .createHmac('sha256', signingSecret)
    .update(sigBasestring, 'utf8')
    .digest('hex');

  const a = Buffer.from(mySignature, 'utf8');
  const b = Buffer.from(signature, 'utf8');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function verifyAndParseWebhook(
  rawBody: string,
  headers: { 'x-slack-signature'?: string; 'x-slack-request-timestamp'?: string }
): { verified: boolean; payload?: unknown } {
  const signature = headers['x-slack-signature'];
  const timestamp = headers['x-slack-request-timestamp'];

  if (!signature || !timestamp || !config.slack.signingSecret) {
    return { verified: false };
  }

  const verified = verifySlackSignature(
    config.slack.signingSecret,
    signature,
    timestamp,
    rawBody
  );

  if (!verified) return { verified: false };

  try {
    const payload = JSON.parse(rawBody);
    return { verified: true, payload };
  } catch {
    // Slack interactive payloads come as URL-encoded with a `payload` field
    const params = new URLSearchParams(rawBody);
    const payloadStr = params.get('payload');
    if (payloadStr) {
      return { verified: true, payload: JSON.parse(payloadStr) };
    }
    return { verified: false };
  }
}

// --- Approval notification ---

function buildApprovalBlocks(approval: ApprovalRecord): unknown[] {
  const payload = approval.payload_after as Record<string, unknown> | null;
  const leadInfo = payload
    ? `*${payload.name || 'N/A'}* — ${payload.email || 'N/A'}\n${payload.company || 'N/A'}`
    : approval.summary;

  return [
    {
      type: 'header',
      text: { type: 'plain_text', text: `🔔 Approval Required: ${approval.type}`, emoji: true },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Agent:* ${approval.agent_name}\n*Priority:* ${approval.priority}\n\n${leadInfo}`,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Summary:* ${approval.summary}`,
      },
    },
    {
      type: 'actions',
      block_id: `approval_${approval.id}`,
      elements: [
        {
          type: 'button',
          text: { type: 'plain_text', text: '✅ Approve', emoji: true },
          style: 'primary',
          action_id: 'approve',
          value: approval.id,
        },
        {
          type: 'button',
          text: { type: 'plain_text', text: '❌ Reject', emoji: true },
          style: 'danger',
          action_id: 'reject',
          value: approval.id,
        },
      ],
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `Approval ID: \`${approval.id}\` | Requested: <!date^${Math.floor(new Date(approval.requested_at).getTime() / 1000)}^{date_short} {time}|${approval.requested_at}>`,
        },
      ],
    },
  ];
}

export async function sendApprovalNotification(approval: ApprovalRecord): Promise<string | null> {
  ensureConfigured();

  if (!config.slack.approvalChannel) {
    logger.warn('SLACK_APPROVAL_CHANNEL not set, skipping notification');
    return null;
  }

  const blocks = buildApprovalBlocks(approval);

  const { data } = await axios.post(
    `${SLACK_API}/chat.postMessage`,
    {
      channel: config.slack.approvalChannel,
      text: `Approval required: ${approval.type} — ${approval.summary}`,
      blocks,
    },
    { headers: headers() }
  );

  if (!data.ok) {
    logger.error({ error: data.error }, 'Failed to send Slack notification');
    return null;
  }

  logger.info({ approval_id: approval.id, ts: data.ts }, 'Slack approval notification sent');
  return data.ts as string;
}

export async function updateApprovalMessage(
  channel: string,
  messageTs: string,
  approval: ApprovalRecord
): Promise<void> {
  ensureConfigured();

  const statusEmoji = approval.status === 'approved' ? '✅' : '❌';
  const statusText = approval.status === 'approved' ? 'APPROVED' : 'REJECTED';

  const { data } = await axios.post(
    `${SLACK_API}/chat.update`,
    {
      channel,
      ts: messageTs,
      text: `${statusEmoji} ${statusText}: ${approval.type} — ${approval.summary}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `${statusEmoji} ${statusText}: ${approval.type}`,
            emoji: true,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Summary:* ${approval.summary}\n*Decided by:* ${approval.decided_by}\n*Notes:* ${approval.notes || 'None'}`,
          },
        },
      ],
    },
    { headers: headers() }
  );

  if (!data.ok) {
    logger.error({ error: data.error }, 'Failed to update Slack message');
  }
}
