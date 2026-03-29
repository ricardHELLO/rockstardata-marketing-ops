import { Router } from 'express';
import { healthCheck } from '../lib/db';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

router.get('/health/ready', async (_req, res) => {
  const dbOk = await healthCheck();
  const status = dbOk ? 200 : 503;
  res.status(status).json({ ok: dbOk, db: dbOk ? 'connected' : 'disconnected' });
});

export default router;
