import { Router } from 'express';
import { asyncHandler } from '../lib/errors';
import {
  searchPersonByEmail,
  searchOrgByDomain,
  searchOrgByName,
  createLeadInPipedrive,
} from '../services/pipedrive.service';

const router = Router();

router.get(
  '/pipedrive/search',
  asyncHandler(async (req, res) => {
    const { email, domain, company } = req.query;

    if (email) {
      const result = await searchPersonByEmail(String(email));
      res.json({ ok: true, data: result });
      return;
    }
    if (domain) {
      const result = await searchOrgByDomain(String(domain));
      res.json({ ok: true, data: result });
      return;
    }
    if (company) {
      const result = await searchOrgByName(String(company));
      res.json({ ok: true, data: result });
      return;
    }

    res.status(400).json({ ok: false, error: { code: 'MISSING_PARAM', message: 'Provide email, domain, or company' } });
  })
);

router.post(
  '/pipedrive/create',
  asyncHandler(async (req, res) => {
    const result = await createLeadInPipedrive(req.body);
    res.status(201).json({ ok: true, data: result });
  })
);

export default router;
