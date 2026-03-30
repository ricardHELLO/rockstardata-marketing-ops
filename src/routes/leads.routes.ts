import { Router } from 'express';
import { asyncHandler } from '../lib/errors';
import { leadIntakeSchema } from '../validators/leads.validator';
import { processIntake, listLeads } from '../services/leads.service';
import { checkBlacklist } from '../services/blacklist.service';
import { searchPersonByEmail, searchOrgByDomain, searchOrgByName } from '../services/pipedrive.service';

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

// Lightweight pre-check for the List Builder agent.
// Call this BEFORE researching a company to avoid wasting tokens on
// leads that are already in CRM or blacklisted.
// Query params: domain (required), company (optional), email (optional)
router.get(
  '/leads/precheck',
  asyncHandler(async (req, res) => {
    const { domain, company, email } = req.query as Record<string, string | undefined>;

    if (!domain) {
      res.status(400).json({ ok: false, error: { code: 'MISSING_PARAM', message: 'domain is required' } });
      return;
    }

    // Run blacklist check and CRM lookups in parallel
    const [blacklistResult, ...crmResults] = await Promise.all([
      checkBlacklist(email, domain, company),
      searchOrgByDomain(domain),
      company ? searchOrgByName(company) : Promise.resolve(null),
      email ? searchPersonByEmail(email) : Promise.resolve(null),
    ]);

    if (blacklistResult.blocked) {
      res.json({ ok: true, skip: true, reason: 'blacklisted', detail: blacklistResult.reason ?? blacklistResult.type });
      return;
    }

    const [orgByDomain, orgByName, personByEmail] = crmResults;
    const inCrm = !!(orgByDomain || orgByName || personByEmail);

    res.json({
      ok: true,
      skip: inCrm,
      reason: inCrm ? 'already_in_crm' : null,
      detail: inCrm
        ? `Found in Pipedrive: ${orgByDomain ? `org by domain (id ${orgByDomain.id})` : orgByName ? `org by name (id ${orgByName.id})` : `person by email (id ${personByEmail!.id})`}`
        : null,
    });
  })
);

export default router;
