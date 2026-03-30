import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import { logger } from './lib/logger';
import { internalAuth } from './middleware/auth';
import { errorHandler } from './middleware/error-handler';
import { requestLogger } from './middleware/request-logger';
import { ZodError } from 'zod';
import { AppError } from './lib/errors';

// Routes
import healthRoutes from './routes/health.routes';
import leadsRoutes from './routes/leads.routes';
import approvalsRoutes from './routes/approvals.routes';
import logsRoutes from './routes/logs.routes';
import pipedriveRoutes from './routes/pipedrive.routes';
import slackRoutes from './routes/slack.routes';
import instantlyRoutes from './routes/instantly.routes';
import adminRoutes from './routes/admin.routes';

const app = express();

// Global middleware
app.use(helmet());
app.use(cors());
// Capture raw body for HMAC signature verification (Slack, Stripe, etc.)
app.use(express.json({
  limit: '1mb',
  verify: (req: express.Request & { rawBody?: string }, _res, buf) => {
    req.rawBody = buf.toString('utf8');
  },
}));
app.use(express.urlencoded({
  extended: false,
  verify: (req: express.Request & { rawBody?: string }, _res, buf) => {
    req.rawBody = buf.toString('utf8');
  },
}));
app.use(requestLogger);

// Public routes (no auth)
app.use(healthRoutes);

// Admin panel (basic auth)
app.use(adminRoutes);

// Slack routes — public (webhook uses Slack HMAC, notify is internal-only network)
app.use('/api', slackRoutes);

// API routes (internal auth required)
app.use('/api', internalAuth);
app.use('/api', leadsRoutes);
app.use('/api', approvalsRoutes);
app.use('/api', logsRoutes);
app.use('/api', pipedriveRoutes);
app.use('/api', instantlyRoutes);

// Zod validation errors → 400
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof ZodError) {
    const appErr = AppError.badRequest('VALIDATION_ERROR', 'Invalid request data', err.errors);
    return errorHandler(appErr, req, res, next);
  }
  next(err);
});

// Global error handler
app.use(errorHandler);

app.listen(config.port, () => {
  logger.info({ port: config.port, env: config.nodeEnv }, 'Marketing Ops backend started');
});

export default app;
