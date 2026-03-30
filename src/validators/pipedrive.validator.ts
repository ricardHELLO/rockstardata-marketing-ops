import { z } from 'zod';

export const createLeadInPipedriveSchema = z.object({
  name: z.string().min(1).trim(),
  email: z.string().email().trim().toLowerCase(),
  company: z.string().min(1).trim(),
  phone: z.string().trim().optional(),
  source: z.string().trim().optional(),
  campaign: z.string().trim().optional(),
  num_locations: z.number().int().positive().optional(),
  concept_type: z.string().trim().optional(),
  pos: z.string().trim().optional(),
  cargo: z.string().trim().optional(),
  linkedin_url: z.string().url().optional(),
  existing_org_id: z.number().int().positive().optional(),
});

export type ValidatedCreateLeadInPipedrive = z.infer<typeof createLeadInPipedriveSchema>;
