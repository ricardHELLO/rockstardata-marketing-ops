import { Router } from 'express';
import { asyncHandler } from '../lib/errors';
import { leadIntakeSchema } from '../validators/leads.validator';
import { processIntake, listLeads } from '../services/leads.service';

const router = Router();

router.post(
  '/leads/intake',
  asyncHandler(async (req, res) => {
    const validated = leadIntakeSchema.parse(req.body);

    const result = await processIntake(validated.source, validated.campaign, validated.contacts);

    res.status(201).json({ ok: true, data: result });
  })
);

router.get(
  '/leads',
  asyncHandler(async (req, res) => {
    const status = req.query.status as string | undefined;
    const campaign = req.query.campaign as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

    const leads = await listLeads(status, campaign, limit, offset);

    res.json({ ok: true, data: leads });
  })
);

export default router;
