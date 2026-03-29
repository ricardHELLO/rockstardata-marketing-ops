import { z } from 'zod';

export const createApprovalSchema = z.object({
  type: z.enum([
    'content_linkedin',
    'content_newsletter',
    'outbound_email',
    'crm_create',
    'crm_create_bulk',
    'crm_stage_change',
    'instantly_draft',
  ]),
  agent_name: z.string().min(1).trim(),
  summary: z.string().min(1).trim(),
  payload_before: z.unknown().optional(),
  payload_after: z.unknown(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  linked_lead_id: z.string().uuid().optional(),
  action_type: z.string().optional(),
});

export const updateApprovalSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  decided_by: z.string().min(1).default('ricard'),
  notes: z.string().optional(),
});

export type ValidatedCreateApproval = z.infer<typeof createApprovalSchema>;
export type ValidatedUpdateApproval = z.infer<typeof updateApprovalSchema>;
