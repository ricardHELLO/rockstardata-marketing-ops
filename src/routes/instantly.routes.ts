import { Router } from 'express';
import { asyncHandler, AppError } from '../lib/errors';
import { storeDraft, listDrafts } from '../services/instantly.service';

const router = Router();

router.post(
  '/instantly/draft',
  asyncHandler(async (req, res) => {
    const { agent_name, draft } = req.body;
    if (!agent_name || !draft) {
      throw AppError.badRequest('MISSING_FIELDS', 'agent_name and draft are required');
    }

    const result = await storeDraft(agent_name, draft);
    res.status(201).json({ ok: true, data: result });
  })
);

router.get(
  '/instantly/drafts',
  asyncHandler(async (req, res) => {
    const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 20;
    const drafts = await listDrafts(limit);
    res.json({ ok: true, data: drafts });
  })
);

export default router;
