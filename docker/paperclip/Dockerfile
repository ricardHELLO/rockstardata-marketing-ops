FROM node:22-alpine

# Install paperclipai globally at build time (pinned to current version)
RUN npm install -g paperclipai@2026.325.0 && npm cache clean --force

# Run onboard (idempotent) then start. Uses DATABASE_URL from env.
CMD ["sh", "-c", "DATABASE_URL=$DATABASE_URL paperclipai onboard --yes && DATABASE_URL=$DATABASE_URL paperclipai run"]
