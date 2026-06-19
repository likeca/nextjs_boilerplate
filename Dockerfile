FROM node:lts-alpine AS base

# --- Dependencies ---
FROM base AS dependencies
WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable&& corepack install -g pnpm@latest
COPY package.json package-lock.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY prisma ./prisma/
COPY prisma.config.ts ./
# RUN npm install -g npm@latest
# RUN npm install -g pnpm@latest
RUN pnpm install --frozen-lockfile
RUN pnpm run build

# --- Build ---
FROM base AS builder
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
RUN npm install -g npm@latest
RUN npm install -g pnpm@latest

# # Coolify passes env vars as --build-arg
ARG DATABASE_URL
ARG NEXT_PUBLIC_APP_NAME
ARG NEXT_PUBLIC_APP_DESCRIPTION
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_ENABLE_TWO_FACTOR
ARG NEXT_PUBLIC_ENABLE_EMAIL_VERIFICATION

ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL=${DATABASE_URL}
ENV NEXT_PUBLIC_APP_NAME=${NEXT_PUBLIC_APP_NAME}
ENV NEXT_PUBLIC_APP_DESCRIPTION=${NEXT_PUBLIC_APP_DESCRIPTION}
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV NEXT_PUBLIC_ENABLE_TWO_FACTOR=${NEXT_PUBLIC_ENABLE_TWO_FACTOR}
ENV NEXT_PUBLIC_ENABLE_EMAIL_VERIFICATION=${NEXT_PUBLIC_ENABLE_EMAIL_VERIFICATION}

# RUN pnpm build

# # --- Production ---
# FROM base AS runner
# WORKDIR /app

# RUN npm install -g npm@latest
# RUN npm install -g pnpm@latest

# ENV NODE_ENV=production
# ENV NEXT_TELEMETRY_DISABLED=1

# # RUN addgroup --system --gid 1001 nodejs
# # RUN adduser --system --uid 1001 nextjs

# # COPY --from=builder /app/public ./public
# # COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# # COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# # COPY --from=builder /app/prisma ./prisma
# # COPY --from=builder /app/scripts ./scripts
# # COPY --from=builder /app/lib ./lib
# # COPY --from=builder /app/package.json ./package.json
# # COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# # # Full node_modules for admin scripts (tsx, better-auth, pg, etc.)
# # COPY --from=deps /app/node_modules ./node_modules

# # # Overlay generated Prisma client
# # COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
# # COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# # USER nextjs

# EXPOSE 3000
# ENV PORT=3000
# ENV HOSTNAME="0.0.0.0"

# CMD ["sh", "-c", "node server.js"]
# # CMD ["sh", "-c", "pnpm prisma migrate deploy && node server.js"]