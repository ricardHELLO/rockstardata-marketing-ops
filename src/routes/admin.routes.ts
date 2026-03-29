import { Router } from 'express';
import express from 'express';
import path from 'path';
import { adminAuth } from '../middleware/auth';

const router = Router();

const adminDir = path.join(__dirname, '..', 'admin');

// Serve admin static files with basic auth
router.use('/admin', adminAuth, express.static(adminDir));

// Fallback: serve index.html for /admin without trailing slash
router.get('/admin', adminAuth, (_req, res) => {
  res.sendFile(path.join(adminDir, 'index.html'));
});

export default router;
