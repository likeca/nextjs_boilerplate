FROM node:lts-alpine AS base

# --- 1. Dependencies ---
FROM base AS dependencies
WORKDIR /app
COPY package.json package-lock.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY prisma ./prisma/
COPY prisma.config.ts ./
RUN npm install -g pnpm@latest
RUN pnpm install --frozen-lockfile

# --- 2. Build ---
FROM base AS builder
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
RUN npm install -g pnpm@latest
COPY . .

ARG DATABASE_URL
ARG NEXT_PUBLIC_APP_NAME
ARG NEXT_PUBLIC_APP_DESCRIPTION
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_ENABLE_TWO_FACTOR
ARG NEXT_PUBLIC_ENABLE_EMAIL_VERIFICATION

ENV CI=true
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL=${DATABASE_URL}
ENV NEXT_PUBLIC_APP_NAME=${NEXT_PUBLIC_APP_NAME}
ENV NEXT_PUBLIC_APP_DESCRIPTION=${NEXT_PUBLIC_APP_DESCRIPTION}
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV NEXT_PUBLIC_ENABLE_TWO_FACTOR=${NEXT_PUBLIC_ENABLE_TWO_FACTOR}
ENV NEXT_PUBLIC_ENABLE_EMAIL_VERIFICATION=${NEXT_PUBLIC_ENABLE_EMAIL_VERIFICATION}

RUN pnpm prisma generate
RUN pnpm build

# --- 3. Production ---
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/lib ./lib
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# Full node_modules
COPY --from=dependencies /app/node_modules ./node_modules

# Overlay generated Prisma client
# COPY --from=builder /app/node_modules/.bin/prisma ./node_modules/.bin/prisma
# COPY --from=builder /app/node_modules/dotenv ./node_modules/dotenv
# COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
# COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
# COPY --from=builder /app/node_modules/.pnpm/@prisma+engines-version* ./node_modules/.pnpm/
# COPY --from=builder /app/node_modules/.pnpm/@prisma+engines* ./node_modules/.pnpm/
# COPY --from=builder /app/node_modules/.pnpm/node_modules/@prisma ./node_modules/.pnpm/node_modules/@prisma

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# CMD ["sh", "-c", "node server.js"]
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]