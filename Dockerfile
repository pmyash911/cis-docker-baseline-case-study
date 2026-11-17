# Production image for the Yalgar Consulting site + dossier pipeline.
# Multi-stage build: dependencies → Next.js standalone build → minimal runner.

FROM node:22-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup -g 1001 -S nodejs \
 && adduser -S nextjs -u 1001

# Static assets and the standalone server (includes traced node_modules).
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Gated dossier PDFs are served only through /api/dossier/<slug> signed links.
# Mount a volume over this directory to change files without rebuilding.
COPY --from=builder --chown=nextjs:nodejs /app/private ./private

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
