# Stage 1: build
FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src/ ./src/
COPY scripts/ ./scripts/

# Compile main app (src/ → dist/)
RUN npm run build

# Compile migrate script separately (scripts/ → dist/, so __dirname resolves migrations/)
RUN npx tsc --target ES2022 --module commonjs --esModuleInterop true \
    --outDir dist --skipLibCheck scripts/migrate.ts

# Stage 2: production runtime
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist
COPY migrations/ ./migrations/

EXPOSE 8000
# Run migrations then start the server
CMD ["sh", "-c", "node dist/migrate.js && node dist/index.js"]
