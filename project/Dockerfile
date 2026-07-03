# syntax=docker/dockerfile:1

# Base image — Node 24 (matches CI), Alpine (musl avoids the glibc sharp
# memory-allocator caveat noted in the Next.js self-hosting docs).
FROM node:24-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# --- Install dependencies (from the lockfile) ---
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# --- Build the Next.js app ---
FROM base AS builder
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# --- Production runner (`next start`) ---
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Run as a non-root user
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs ./next.config.mjs
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
# .next is chowned so `next start` can write the ISR / image cache at runtime
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next

USER nextjs
EXPOSE 3000

# `next start` honors PORT / HOSTNAME and handles image optimization (sharp)
# with zero config. Graceful shutdown (SIGTERM) drains in-flight requests.
CMD ["npm", "start"]
