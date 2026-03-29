import { Router } from 'express';
import { asyncHandler } from '../lib/errors';
import { createLogSchema } from '../validators/logs.validator';
import { createLog, listLogs } from '../services/agent-log.service';

const router = Router();

router.post(
  '/logs',
  asyncHandler(async (req, res) => {
    const validated = createLogSchema.parse(req.body);
    const log = await createLog(validated);
    res.status(201).json({ ok: true, data: log });
  })
);

router.get(
  '/logs',
  asyncHandler(async (req, res) => {
    const logs = await listLogs({
      agent_name: req.query.agent as string | undefined,
      level: req.query.level as string | undefined,
      action: req.query.action as string | undefined,
      from: req.query.from as string | undefined,
      to: req.query.to as string | undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 100,
      offset: req.query.offset ? parseInt(req.query.offset as string, 10) : 0,
    });
    res.json({ ok: true, data: logs });
  })
);

export default router;
