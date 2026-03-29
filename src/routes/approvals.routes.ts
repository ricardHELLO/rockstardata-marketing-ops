import { Router } from 'express';
import { asyncHandler } from '../lib/errors';
import { createApprovalSchema, updateApprovalSchema } from '../validators/approvals.validator';
import {
  createApproval,
  listApprovals,
  getApprovalById,
  updateApprovalDecision,
} from '../services/approvals.service';
import { ApprovalStatus } from '../types';

const router = Router();

router.get(
  '/approvals',
  asyncHandler(async (req, res) => {
    const status = (req.query.status as string | undefined) as ApprovalStatus | undefined;
    const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 50;
    const offset = req.query.offset ? parseInt(String(req.query.offset), 10) : 0;

    const approvals = await listApprovals(status, limit, offset);
    res.json({ ok: true, data: approvals });
  })
);

router.get(
  '/approvals/:id',
  asyncHandler(async (req, res) => {
    const approval = await getApprovalById(String(req.params.id));
    res.json({ ok: true, data: approval });
  })
);

router.post(
  '/approvals',
  asyncHandler(async (req, res) => {
    const validated = createApprovalSchema.parse(req.body);
    const approval = await createApproval(validated);
    res.status(201).json({ ok: true, data: approval });
  })
);

router.patch(
  '/approvals/:id',
  asyncHandler(async (req, res) => {
    const validated = updateApprovalSchema.parse(req.body);
    const approval = await updateApprovalDecision(String(req.params.id), validated);
    res.json({ ok: true, data: approval });
  })
);

export default router;
