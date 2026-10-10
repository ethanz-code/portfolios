FROM --platform=$BUILDPLATFORM oven/bun:1.3.10-alpine AS builder

ARG BUILDPLATFORM
ENV ASTRO_TELEMETRY_DISABLED=1

# 境内构建时经 .env 的 ALPINE_MIRROR 换 apk 源，默认不动
ARG ALPINE_MIRROR=""

RUN if [ -n "$ALPINE_MIRROR" ]; then sed -i "s#https://dl-cdn.alpinelinux.org#${ALPINE_MIRROR}#g" /etc/apk/repositories; fi \
 && apk add --no-cache python3 make g++ nodejs npm

WORKDIR /app

# bun/npm 统一走 npmmirror；sharp 0.32 的 libvips 二进制走 SHARP_DIST_BASE_URL（GitHub releases 境内卡死）。
# 该变量需自带版本目录，版本号随 lockfile 里 sharp 升级同步改
ENV NPM_CONFIG_REGISTRY=https://registry.npmmirror.com \
    SHARP_DIST_BASE_URL=https://registry.npmmirror.com/-/binary/sharp-libvips/v8.14.5/

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
