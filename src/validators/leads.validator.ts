import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(1).trim(),
  email: z.string().email().trim().toLowerCase(),
  phone: z.string().trim().optional(),
  company: z.string().min(1).trim(),
  num_locations: z.number().int().positive().optional(),
  concept_type: z.string().trim().optional(),
  pos: z.string().trim().optional(),
  campaign: z.string().trim().optional(),
  cargo: z.string().trim().optional(),
  linkedin_url: z.string().url().optional(),
});

export const leadIntakeSchema = z.object({
  source: z.enum(['outbound', 'inbound_form', 'scraper', 'import', 'webhook']),
  campaign: z.string().trim().optional(),
  contacts: z.array(contactSchema).min(1).max(100),
});

export type ValidatedLeadIntake = z.infer<typeof leadIntakeSchema>;
