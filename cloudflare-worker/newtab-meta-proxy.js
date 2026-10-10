/**
 * new-tab 元数据代理：为 new-tab 页面做 CORS 转发，用于抓取站点
 * HTML（标题 / 描述 / 图标候选）与站点图标。
 *
 * 用法：GET https://meta.itcox.cn/?url=<encodeURIComponent(目标地址)>
 * 防护：仅 GET、仅 http/https、拦截内网与环回地址、上游 9 秒超时。
 */

const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);
const BLOCKED_HOST_PATTERN = /^(localhost$|127\.|0\.|10\.|192\.168\.|169\.254\.|.*\.local$|.*\.lan$)/i;
const BLOCKED_HOST_172 = /^172\.(1[6-9]|2\d|3[01])\./;
const UPSTREAM_TIMEOUT_MS = 9000;

const corsHeaders = {
	"access-control-allow-origin": "*",
	"access-control-allow-methods": "GET, OPTIONS",
	"access-control-allow-headers": "*",
	"access-control-max-age": "86400",
};

const json = (body, status) =>
	new Response(JSON.stringify(body), {
		status,
		headers: { "content-type": "application/json; charset=utf-8", ...corsHeaders },
	});

const isBlockedHost = (hostname) =>
	BLOCKED_HOST_PATTERN.test(hostname) ||
	BLOCKED_HOST_172.test(hostname) ||
	hostname.includes(":");

export default {
	async fetch(request) {
		if (request.method === "OPTIONS") {
			return new Response(null, { status: 204, headers: corsHeaders });
		}

		if (request.method !== "GET") {
			return json({ error: "只允许 GET 请求" }, 405);
		}

		const rawUrl = new URL(request.url).searchParams.get("url") ?? "";

		let target;
		try {
			target = new URL(rawUrl);
		} catch {
			return json({ error: "url 参数缺失或格式不对" }, 400);
		}

		if (!ALLOWED_PROTOCOLS.has(target.protocol) || isBlockedHost(target.hostname)) {
			return json({ error: "目标地址不允许访问" }, 400);
		}

		let upstream;
		try {
			upstream = await fetch(target.href, {
				redirect: "follow",
				signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
				headers: {
					"user-agent":
						"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
					accept: "text/html,application/xhtml+xml,image/*;q=0.9,*/*;q=0.8",
					"accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
				},
			});
		} catch {
			return json({ error: "上游站点连接失败或超时" }, 504);
		}

		const headers = new Headers();
		const contentType = upstream.headers.get("content-type");
		if (contentType) {
			headers.set("content-type", contentType);
		}
		headers.set("cache-control", "public, max-age=3600");
		for (const [name, value] of Object.entries(corsHeaders)) {
			headers.set(name, value);
		}

		return new Response(upstream.body, { status: upstream.status, headers });
	},
};
