import dotenv from 'dotenv';
dotenv.config();

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optional(name: string, fallback: string): string {
  return process.env[name] || fallback;
}

export const config = Object.freeze({
  port: parseInt(optional('PORT', '8000'), 10),
  nodeEnv: optional('NODE_ENV', 'development'),
  logLevel: optional('LOG_LEVEL', 'info'),

  databaseUrl: required('DATABASE_URL'),

  internalApiKey: required('INTERNAL_API_KEY'),

  pipedrive: {
    apiToken: optional('PIPEDRIVE_API_TOKEN', ''),
    baseUrl: 'https://api.pipedrive.com/v1',
    ownerId: parseInt(optional('PIPEDRIVE_OWNER_ID', '0'), 10),
    fields: {
      numLocations: optional('PIPEDRIVE_FIELD_NUM_LOCATIONS', ''),
      conceptType: optional('PIPEDRIVE_FIELD_CONCEPT_TYPE', ''),
      pos: optional('PIPEDRIVE_FIELD_POS', ''),
      source: optional('PIPEDRIVE_FIELD_SOURCE', ''),
      campaign: optional('PIPEDRIVE_FIELD_CAMPAIGN', ''),
      cargo: optional('PIPEDRIVE_FIELD_CARGO', ''),
      linkedinUrl: optional('PIPEDRIVE_FIELD_LINKEDIN_URL', ''),
    },
    pipelineId: parseInt(optional('PIPEDRIVE_PIPELINE_ID', '0'), 10),
  },

  slack: {
    botToken: optional('SLACK_BOT_TOKEN', ''),
    signingSecret: optional('SLACK_SIGNING_SECRET', ''),
    approvalChannel: optional('SLACK_APPROVAL_CHANNEL', ''),
  },

  instantly: {
    apiKey: optional('INSTANTLY_API_KEY', ''),
  },

  adminPassword: optional('ADMIN_PASSWORD', 'admin'),

  isDev: optional('NODE_ENV', 'development') === 'development',
});
