FROM --platform=$BUILDPLATFORM oven/bun:1.3.10-alpine AS builder

ARG BUILDPLATFORM
ENV ASTRO_TELEMETRY_DISABLED=1

RUN apk add --no-cache python3 make g++ nodejs npm

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
RUN cd /app && npm rebuild sharp

COPY . .
RUN bun run check && bun run build

FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
