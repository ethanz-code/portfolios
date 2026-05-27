---
title: "安装奖励技术方案：书签不可验真与 PWA 校验路径"
description: "说明收藏奖励为什么缺少验真链路，以及 PWA 安装奖励如何建立更可控的领取边界。"
publishedDate: "2026-05-18"
updatedDate: "2026-05-23"
tags:
  - "PWA"
  - "浏览器"
  - "风控"
---

## 结论先行

浏览器书签属于用户隐私区，页面脚本无法读取书签状态，验真链路天然断裂。「收藏成功」不适合作为可信发奖触发条件。

需要绑定「用户以独立入口打开站点」这一行为时，应改用 PWA 安装信号，配合服务端一次性校验和基础风控。

---

## 一、为什么「书签收藏」验不了真

浏览器没有 `bookmarkadd` 事件，也不会向页面脚本暴露书签列表、目录或收藏结果。能监听的边缘信号只有：

- `keydown`：用户按了 Ctrl+D / Cmd+D
- `visibilitychange` / `blur`：页面失焦，可能是弹窗出现了

这些信号最多说明「用户可能触发了收藏动作」，不能证明书签被实际创建。

```typescript
// 只能证明用户按过某些键，不能证明收藏成功
window.addEventListener('keydown', (event) => {
  const maybeBookmark = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'd';
  if (maybeBookmark) {
    showBookmarkGuide(); // 只能做引导提示，不能据此发奖
  }
});
```

后端同样看不到书签。如果前端把 `tag: 'install_reward'` 直接 POST 给后端，用户可以在控制台直接调接口，完全不可信任。唯一能读到书签的方式是浏览器扩展（`chrome.bookmarks` API），移动端不支持，不适合奖励场景。

---

## 二、为什么改用 PWA 安装信号

| 信号 | 触发时机 | 平台 |
| --- | --- | --- |
| `beforeinstallprompt` | 浏览器判断站点满足 PWA 安装条件 | Chrome 系 |
| `appinstalled` | 用户完成安装 | Chrome 系 |
| `display-mode: standalone` | 从桌面图标打开 | 跨平台 |
| `navigator.standalone` | 从主屏图标打开 | iOS Safari |

这些信号仍然是客户端信号，不是银行级校验。但对低额一次性奖励而言，「能解释、能落库、能防重复」已经足够。

---

## 三、前端：收集安装信号

```typescript
type InstallClaimSignal = {
  url: string;
  standalone: boolean;
  displayMode: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser';
  navigatorStandalone?: boolean;
};

const detectStandalone = (): boolean => {
  const ios = (window.navigator as Navigator & { standalone?: boolean }).standalone;
  return window.matchMedia('(display-mode: standalone)').matches || ios === true;
};

const getDisplayMode = (): InstallClaimSignal['displayMode'] => {
  if (window.matchMedia('(display-mode: standalone)').matches) return 'standalone';
  if (window.matchMedia('(display-mode: fullscreen)').matches) return 'fullscreen';
  if (window.matchMedia('(display-mode: minimal-ui)').matches) return 'minimal-ui';
  return 'browser';
};

const buildInstallSignal = (): InstallClaimSignal => ({
  url: window.location.href,
  standalone: detectStandalone(),
  displayMode: getDisplayMode(),
  navigatorStandalone: (window.navigator as Navigator & { standalone?: boolean }).standalone,
});

// 前端拦截：明显不满足条件时先提示，不作最终校验
const signal = buildInstallSignal();
if (!signal.standalone) {
  showToast('请先从桌面或主屏幕图标打开后再领取');
  return;
}
await api.post('/app/user/reward/install/claim', signal);
```

---

## 四、后端：一次性发奖逻辑

```typescript
private hasInstallOpenSignal(signal?: InstallClaimSignal): boolean {
  return (
    signal?.standalone === true ||
    signal?.navigatorStandalone === true ||
    signal?.displayMode === 'standalone' ||
    signal?.displayMode === 'fullscreen' ||
    signal?.displayMode === 'minimal-ui'
  );
}

async claim(userId: number, signal?: InstallClaimSignal) {
  if (!this.hasInstallOpenSignal(signal)) {
    throw new BizException('请先从桌面或主屏幕图标打开后再领取');
  }

  return await this.dataSource.manager.transaction(async (manager) => {
    // 锁用户行，防并发重复领取
    await manager.findOne(UserEntity, {
      where: { id: userId },
      lock: { mode: 'pessimistic_write' },
    });

    const existing = await manager.findOne(InstallRewardEntity, { where: { userId } });
    if (existing) return { alreadyClaimed: true, amount: Number(existing.rewardAmount) };

    const amount = this.generateRewardAmount();
    await manager.save(InstallRewardEntity, { userId, rewardAmount: amount });
    await manager.increment(UserWalletEntity, { userId }, 'balance', amount);
    await manager.save(FundFlowEntity, { userId, amount, type: 'install_reward' });

    return { alreadyClaimed: false, amount };
  });
}
```

---

## 五、边界与取舍

- PWA 信号有技术用户可以伪造，但伪造成本远高于奖励价值，对低额一次性场景可以接受
- 奖励金额较高时，可叠加设备指纹、IP 限频、账号风控
- 「收藏按钮」适合做引导和用户教育，不适合绑定金额奖励
- 发奖后应有审计日志，方便事后核查异常领取行为

---

## 后续待验证

- iOS 18+ 对 `navigator.standalone` 的支持是否有变化
- Android TWA 场景下 display-mode 信号是否可靠
- 是否引入设备指纹服务作为补充风控
