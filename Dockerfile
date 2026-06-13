FROM --platform=$BUILDPLATFORM oven/bun:1.3.10-alpine AS builder

ARG BUILDPLATFORM
ENV ASTRO_TELEMETRY_DISABLED=1

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run check && bun run build

FROM node:20-alpine AS rebuilder

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

RUN npm rebuild better-sqlite3

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=rebuilder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

RUN mkdir -p /app/data

ENV HOST=0.0.0.0
ENV PORT=4321
ENV VISIT_DB_PATH=/app/data/visits.db

EXPOSE 4321

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:4321/ >/dev/null || exit 1

CMD ["node", "dist/server/entry.mjs"]
