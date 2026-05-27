FROM --platform=$BUILDPLATFORM oven/bun:1.3.10-alpine AS builder

ARG BUILDPLATFORM
ARG DEPLOYED_AT
ENV ASTRO_TELEMETRY_DISABLED=1
ENV DEPLOYED_AT=$DEPLOYED_AT

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run check && bun run build

FROM nginx:1.27-alpine

COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1
