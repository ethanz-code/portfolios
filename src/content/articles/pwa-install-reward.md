---
title: "安装奖励技术方案：书签不可验真与 PWA 校验路径"
description: "为什么普通网页不能验证收藏成功，以及安装奖励如何设计得更可控。"
publishedDate: "2026-05-18"
updatedDate: "2026-05-18"
tags:
  - "PWA"
  - "浏览器"
  - "风控"
---

普通网页无法真正监听或验证用户是否收藏了浏览器书签。

浏览器不会把书签列表、收藏确认结果暴露给页面脚本。这是隐私和安全边界，不是前端技巧问题。

因此奖励口径不应该叫“收藏奖励”。更稳妥的实现是“安装奖励”：用户把站点安装为 PWA，或在 iOS Safari 添加到主屏幕后，从独立窗口或主屏幕图标打开，再领取一次性奖励。

## 为什么不能做真正收藏监听

页面最多能感知一些弱信号：

- 用户按下 `Ctrl + D` 或 `Command + D`。
- 页面触发 `blur`。
- 页面触发 `visibilitychange`。
- 用户在弹窗附近停留了一段时间。

这些都不能证明“收藏成功”。

`Ctrl + D` 只能说明用户按过快捷键。用户可能取消收藏，也可能浏览器拦截，也可能快捷键被系统、插件或浏览器行为覆盖。

浏览器书签 API 只存在于扩展能力中。普通网页没有 `bookmarks` 权限，也不能读取用户书签列表。

```ts
window.addEventListener("keydown", (event) => {
  const maybeBookmarkShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "d";

  if (maybeBookmarkShortcut) {
    // 这里只能说明用户按过快捷键。
    // 不能说明用户确认收藏，也不能说明收藏写入成功。
  }
});
```

如果后端只接收前端上报的 `tag=bookmarked`，风险更明显：

```http
POST /reward/bookmark/claim
Content-Type: application/json

{ "tag": "bookmarked" }
```

这个请求可以被脚本直接伪造。后端没有可靠证据证明用户真的完成了收藏动作。

## PWA 路径为什么更合适

PWA 安装也不是绝对不可伪造，但它至少有更明确的浏览器状态和用户路径。

电脑和 Android Chromium 可以使用：

- `beforeinstallprompt`：浏览器认为站点满足安装条件时触发。
- `appinstalled`：用户接受安装后触发。
- `display-mode: standalone`：用户从安装后的入口打开。

iOS Safari 不支持标准 `beforeinstallprompt` 自动安装弹窗。用户必须手动点分享按钮，再选择“添加到主屏幕”。

iOS 可用于判断的信号是：

- `navigator.standalone === true`
- `window.matchMedia("(display-mode: standalone)").matches`

也就是说，iOS 不能在浏览器页里确认“刚刚添加成功”，只能在用户从主屏幕图标打开后确认当前处于 standalone 模式。

```ts
const isStandalone =
  window.matchMedia("(display-mode: standalone)").matches ||
  ("standalone" in navigator && Boolean(navigator.standalone));

if (isStandalone) {
  // 允许展示领取入口，但最终仍要由后端做一次性领取控制。
}
```

## 前端应该收集什么

前端不要声称自己能证明安装成功。它只负责收集浏览器侧可见信号，并把用户引导到正确路径。

可以上报：

- `displayMode`
- `navigatorStandalone`
- `url`
- `userAgent`
- 是否触发过 `appinstalled`

示例：

```ts
const displayMode = window.matchMedia("(display-mode: standalone)").matches
  ? "standalone"
  : "browser";

await fetch("/app/user/reward/install/claim", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    displayMode,
    navigatorStandalone: "standalone" in navigator ? Boolean(navigator.standalone) : false,
    url: location.href,
  }),
});
```

## 后端应该怎么控制

后端不要把“客户端说已经安装”当成唯一依据。更稳的做法是把它当成领取前置信号，再叠加账号、活动配置和一次性领取控制。

关键动作：

- 查活动开关。
- 查用户是否已领取。
- 检查是否有安装打开信号。
- 在事务里写领取记录。
- 在同一个事务里写余额和资金流水。

伪代码：

```ts
await dataSource.transaction(async (manager) => {
  const existing = await manager.findOne(UserInstallRewardEntity, {
    where: { userId },
    lock: { mode: "pessimistic_write" },
  });

  if (existing) {
    throw new Error("已领取");
  }

  if (!hasInstallOpenSignal(payload)) {
    throw new Error("请从桌面或主屏幕图标打开后领取");
  }

  await manager.save(UserInstallRewardEntity, { userId, amount });
  await manager.increment(UserBalanceEntity, { userId }, "balance", amount);
  await manager.save(UserBalanceFlowEntity, {
    userId,
    amount,
    flowType: "install_reward",
    relatedType: "install",
  });
});
```

这里的重点不是“前端状态绝对可信”，而是把奖励设计成成本可控的一次性动作。

## 风控边界

这个方案能防止同一账号反复领取，因为后端有唯一记录。

它仍不能完全防止：

- 用户直接调用接口伪造领取。
- 批量注册账号领取。
- 自动化脚本登录后请求接口。

如果奖励金额较高，还要叠加手机号绑定、新账号等待期、验证码、IP 频控、设备指纹、后台审计，或者把奖励改为优惠券和积分。

## 结论

收藏动作不可验真，不适合作为发钱依据。

PWA 或主屏 App 打开路径可验证性更强，但也不是绝对安全。正确做法是把它设计成“浏览器信号 + 后端一次性约束 + 风控策略”的组合，而不是相信某个前端事件。
