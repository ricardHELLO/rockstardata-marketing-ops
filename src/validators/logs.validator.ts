import { z } from 'zod';

export const createLogSchema = z.object({
  level: z.enum(['info', 'warn', 'error']),
  agent_name: z.string().min(1).trim(),
  action: z.string().min(1).trim(),
  details: z.unknown().optional(),
  duration_ms: z.number().int().nonnegative().optional(),
  cost_cents: z.number().int().nonnegative().optional(),
});

export type ValidatedCreateLog = z.infer<typeof createLogSchema>;
