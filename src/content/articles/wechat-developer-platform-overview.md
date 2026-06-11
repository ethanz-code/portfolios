---
title: "微信开发者平台体系总览"
description: "梳理微信开放平台、公众平台、支付平台和开发者平台的职责与接入关系。"
publishedDate: "2026-06-01"
updatedDate: "2026-06-09"
tags:
  - "微信"
  - "开放平台"
  - "小程序"
---

> 📌 整理来源：微信官方文档（[developers.weixin.qq.com](https://developers.weixin.qq.com/platform) / [open.weixin.qq.com](https://open.weixin.qq.com) / [mp.weixin.qq.com](https://mp.weixin.qq.com) / [pay.weixin.qq.com](https://pay.weixin.qq.com/doc/v3/merchant/4012062524)）— 2026 年 6 月

# 一、平台体系概览
微信开发生态由四大核心平台组成，每个平台职责不同，注册入口也不同。搞清楚这四个平台的关系，是进入微信生态开发的第一步。
<table header-row="true" header-column="false">
<tr>
<td>平台</td>
<td>网址</td>
<td>核心定位</td>
</tr>
<tr>
<td>微信开放平台</td>
<td>[open.weixin.qq.com](https://open.weixin.qq.com)</td>
<td>UnionID 统一身份 + 移动/网站 App 接入</td>
</tr>
<tr>
<td>微信公众平台</td>
<td>[mp.weixin.qq.com](https://mp.weixin.qq.com)</td>
<td>公众号 / 服务号 / 小程序 / 小游戏 注册与运营</td>
</tr>
<tr>
<td>微信支付平台</td>
<td>[pay.weixin.qq.com](https://pay.weixin.qq.com)</td>
<td>商户号申请、支付产品接入、结算管理</td>
</tr>
<tr>
<td>微信开发者平台</td>
<td>[developers.weixin.qq.com/platform](https://developers.weixin.qq.com/platform)</td>
<td>开发者一站式工作台（配置、API 监控、绑定关系管理）</td>
</tr>
</table>

---
# 二、微信开放平台（open.weixin.qq.com）
官方文档：[开放平台介绍](https://developers.weixin.qq.com/doc/oplatform/open/intro.html)

## 🎯 能干什么
- 将移动 App、网站应用、小程序、公众号等所有产品绑定到同一账号，获得 UnionID，实现跨应用用户身份打通
- 为移动应用（iOS / Android / HarmonyOS）接入微信登录、微信分享、微信支付
- 为网站应用（PC 网页）接入微信扫码登录
- 管理第三方平台（代理运营他人公众号 / 小程序）

## 📋 注册与管理
- [open.weixin.qq.com](https://open.weixin.qq.com) → 注册开发者账号 → 需要企业资质认证（300元/年）
- 管理：[open.weixin.qq.com 后台](https://open.weixin.qq.com)，部分功能已迁移至 [微信开发者平台](https://developers.weixin.qq.com/platform)

## 🔑 核心概念
- AppID / AppSecret：每个应用的唯一凭证，所有 API 调用的基础
- OpenID：同一用户对不同应用有不同 OpenID（用户 + AppID → 唯一标识）
- UnionID：同一开放平台账号下所有应用共享同一个 UnionID（跨产品用户打通的关键）

## 🛠 主要 API

```plaintext

# 移动应用 / 网站应用微信登录
GET https://api.weixin.qq.com/sns/oauth2/access_token
  ?appid=APPID&secret=SECRET&code=CODE&grant_type=authorization_code

# 获取用户信息
GET https://api.weixin.qq.com/sns/userinfo
  ?access_token=TOKEN&openid=OPENID

# PC 扫码登录（网站应用）
https://open.weixin.qq.com/connect/qrconnect
  ?appid=APPID&redirect_uri=URI&response_type=code&scope=snsapi_login
```

---
# 三、微信公众平台（mp.weixin.qq.com）
官方入口：[mp.weixin.qq.com](https://mp.weixin.qq.com)  |  开发文档：[公众号文档](https://developers.weixin.qq.com/doc/subscription/guide/) / [服务号文档](https://developers.weixin.qq.com/doc/service/guide/)
公众平台是注册和运营所有微信内产品的主入口，包含四种账号类型。

## 📊 账号类型对比
<table header-row="true" header-column="false">
<tr>
<td>类型</td>
<td>定位</td>
<td>群发限制</td>
<td>微信支付</td>
<td>消息展示位置</td>
</tr>
<tr>
<td>公众号（原订阅号）</td>
<td>媒体/个人，资讯传播</td>
<td>每天 1 条</td>
<td>❌ 不支持</td>
<td>订阅号文件夹（二级）</td>
</tr>
<tr>
<td>服务号</td>
<td>企业服务交互</td>
<td>每月 4 条</td>
<td>✅ 认证后支持</td>
<td>聊天列表（一级）</td>
</tr>
<tr>
<td>小程序</td>
<td>轻应用，媲美原生 App</td>
<td>—</td>
<td>✅ 支持</td>
<td>—</td>
</tr>
<tr>
<td>小游戏</td>
<td>游戏类轻应用</td>
<td>—</td>
<td>✅（非个人开发者）</td>
<td>—</td>
</tr>
</table>

## ⚠️ 公众号 vs 服务号重要区别
- 消息入口：服务号消息出现在聊天列表（一级），公众号折叠在订阅号文件夹（二级，要点两次）
- 微信支付：仅服务号认证后支持，公众号不支持
- 自定义菜单：服务号无需认证即有；公众号需认证才有
- 多客服：服务号支持，公众号不支持

> ℹ️ 注：原「订阅号」已正式更名为「公众号」

## 🛠 主要 API（公众号 / 服务号）
文档：[公众号 API 文档](https://developers.weixin.qq.com/doc/subscription/guide/)

```plaintext

# 获取 access_token（所有 API 的入口凭证，有效期 2 小时，需服务端缓存刷新）
GET https://api.weixin.qq.com/cgi-bin/token
  ?grant_type=client_credential&appid=APPID&secret=SECRET

# 网页授权（在微信内 H5 获取用户身份）
https://open.weixin.qq.com/connect/oauth2/authorize
  ?appid=APPID&redirect_uri=URI&response_type=code&scope=snsapi_userinfo

# 发送模板消息
POST https://api.weixin.qq.com/cgi-bin/message/template/send

# 内容安全检测
POST https://api.weixin.qq.com/wxa/msg_sec_check
```

---
# 四、小程序 vs 小游戏
小程序文档：[developers.weixin.qq.com/miniprogram](https://developers.weixin.qq.com/miniprogram/dev/framework/)  |  小游戏文档：[developers.weixin.qq.com/minigame](https://developers.weixin.qq.com/minigame/introduction/)
<table header-row="true" header-column="false">
<tr>
<td>对比项</td>
<td>小程序</td>
<td>小游戏</td>
</tr>
<tr>
<td>开发语言</td>
<td>WXML + WXSS + JS</td>
<td>JS + Canvas（无 WXML/WXSS）</td>
</tr>
<tr>
<td>注册入口</td>
<td>[mp.weixin.qq.com](https://mp.weixin.qq.com)</td>
<td>[mp.weixin.qq.com](https://mp.weixin.qq.com)（完善信息时选「游戏」类目）</td>
</tr>
<tr>
<td>账号通用</td>
<td>❌ 不能用小游戏账号</td>
<td>❌ 不能用小程序账号</td>
</tr>
<tr>
<td>个人开发者限制</td>
<td>部分类目受限</td>
<td>暂不支持虚拟支付（内购）</td>
</tr>
<tr>
<td>不支持的功能</td>
<td>无特殊限制</td>
<td>附近小程序、模板消息、客服消息、业务域名配置</td>
</tr>
<tr>
<td>开发工具</td>
<td>微信开发者工具（官方 IDE）</td>
<td>微信开发者工具（小游戏版）</td>
</tr>
</table>

> 🧮 公式：小游戏 = 小程序 + (Canvas渲染 / 文件系统 / 多线程) − (多页面 / WXSS / WXML)

---
# 五、移动应用 & 网站应用
注册与管理均在 [open.weixin.qq.com](https://open.weixin.qq.com)，需企业认证（300元/年）。
<table header-row="true" header-column="false">
<tr>
<td>类型</td>
<td>注册入口</td>
<td>认证要求</td>
<td>主要功能</td>
</tr>
<tr>
<td>移动应用（iOS/Android/鸿蒙）</td>
<td>[open.weixin.qq.com → 移动应用](https://developers.weixin.qq.com/doc/oplatform/Mobile_App/guideline/create.html)</td>
<td>✅ 企业认证（300元/年）</td>
<td>微信登录、分享、支付、收藏</td>
</tr>
<tr>
<td>网站应用（PC 网页）</td>
<td>[open.weixin.qq.com → 网站应用](https://developers.weixin.qq.com/doc/oplatform/Website_App/WeChat_PC_APIs/guideline)</td>
<td>✅ 企业认证</td>
<td>PC 端微信扫码登录</td>
</tr>
</table>

## 移动应用 SDK 接入
接入指南：[iOS](https://developers.weixin.qq.com/doc/oplatform/Mobile_App/Access_Guide/iOS) / [Android](https://developers.weixin.qq.com/doc/oplatform/Mobile_App/Access_Guide/Android) / [鸿蒙](https://developers.weixin.qq.com/doc/oplatform/Mobile_App/Access_Guide/ohos)

```plaintext

# Android（gradle）
implementation 'com.tencent.mm.opensdk:wechat-sdk-android:+'

# iOS（CocoaPods）
pod 'WechatOpenSDK'

# 鸿蒙 HarmonyOS：通过 ohpm 引入微信 OpenSDK
```

---
# 六、微信开发者平台（一站式工作台）
地址：[developers.weixin.qq.com/platform](https://developers.weixin.qq.com/platform)
这是面向开发者的统一管理后台，获得「开发者权限」后可在此集中管理旗下所有微信产品。

## 🎯 能干什么
- 管理和配置：公众号、服务号、小程序、小游戏、小店、移动应用、网站应用的开发信息（AppID、域名白名单等）
- 管理产品间的绑定关系（如将小程序绑定到开放平台账号以获取 UnionID）
- 管理授权关系（如第三方平台代运营授权）
- API 接口监控与告警（调用量、错误率、耗时统计）
- 成员管理（添加开发者、体验者权限）
- 查看微信支付、流量主等数据概览

---
# 七、统一身份机制（UnionID）
官方说明：[开放平台介绍 - UnionID 机制](https://developers.weixin.qq.com/doc/oplatform/open/intro.html)
这是微信跨产品打通用户体系的核心机制，理解它对设计会员系统至关重要。
<table header-row="true" header-column="false">
<tr>
<td>标识</td>
<td>作用域</td>
<td>说明</td>
</tr>
<tr>
<td>OpenID</td>
<td>单个应用</td>
<td>同一用户在不同应用的 OpenID 不同，无法跨产品关联</td>
</tr>
<tr>
<td>UnionID</td>
<td>同一开放平台账号下所有产品</td>
<td>AppID 不变且开放平台账号不变时永久稳定</td>
</tr>
</table>

> 🔑 速记公式：微信用户 + AppID = OpenID | 微信用户 + 开放平台账号 = UnionID

## 如何获得 UnionID
1. 将小程序 / 公众号 / 移动应用全部绑定到同一个开放平台账号（[open.weixin.qq.com](https://open.weixin.qq.com)）
2. 用户授权登录任意一个产品后，即可在后端通过 API 获取该用户的 UnionID
3. 用 UnionID 作为用户唯一 key，关联所有产品的用户数据

## 典型应用场景
- 会员体系打通：小程序积分 + App 购买记录 + 公众号互动数据，用 UnionID 统一归一
- 跨端数据分析：同一用户的多端行为关联分析
- 统一用户画像：整合各端数据建立完整用户档案

---
# 八、注册决策树：我该在哪里注册？
根据你的需求，选择对应平台和账号类型：
<table header-row="true" header-column="false">
<tr>
<td>我想做的事</td>
<td>账号类型</td>
<td>注册入口</td>
<td>认证要求</td>
</tr>
<tr>
<td>内容传播 / 推文 / 自媒体</td>
<td>公众号</td>
<td>[mp.weixin.qq.com](https://mp.weixin.qq.com)</td>
<td>个人可注册</td>
</tr>
<tr>
<td>企业服务 + 微信支付 + 高级接口</td>
<td>服务号</td>
<td>[mp.weixin.qq.com](https://mp.weixin.qq.com)</td>
<td>企业认证（300元/年）</td>
</tr>
<tr>
<td>轻应用（功能完整，接近原生 App）</td>
<td>小程序</td>
<td>[mp.weixin.qq.com](https://mp.weixin.qq.com)</td>
<td>个人/企业均可</td>
</tr>
<tr>
<td>游戏</td>
<td>小游戏</td>
<td>[mp.weixin.qq.com](https://mp.weixin.qq.com)（选游戏类目）</td>
<td>个人/企业均可；虚拟支付需企业</td>
</tr>
<tr>
<td>iOS/Android/鸿蒙 App 接入微信</td>
<td>移动应用</td>
<td>[open.weixin.qq.com](https://open.weixin.qq.com)</td>
<td>企业认证（300元/年）</td>
</tr>
<tr>
<td>PC 网站微信扫码登录</td>
<td>网站应用</td>
<td>[open.weixin.qq.com](https://open.weixin.qq.com)</td>
<td>企业认证（300元/年）</td>
</tr>
<tr>
<td>跨产品用户体系打通</td>
<td>开放平台账号（绑定所有产品）</td>
<td>[open.weixin.qq.com](https://open.weixin.qq.com)</td>
<td>企业认证</td>
</tr>
</table>

---
# 九、常见坑 & 注意事项

## 🚫 小程序和小游戏账号不互通
即使类目选错，AppID 已生成就无法更改账号类型，必须重新注册新账号。注册前务必确认是小程序还是小游戏。

## 🚫 UnionID 不是自动就有的
必须先将所有产品绑定到同一开放平台账号，才能获取 UnionID。单独用 mp.weixin.qq.com 注册的小程序，只有 OpenID，没有 UnionID。

## 🚫 个人主体有功能限制
个人注册的公众号无法使用微信支付、多客服、模板消息等高级功能。小游戏个人主体无法开通虚拟支付（内购）。

## 🚫 access_token 有效期只有 2 小时
需要在服务端定时刷新并缓存 access_token，不能每次请求都重新获取（有调用频率限制，超限会返回 45009 错误）。

## 🚫 小程序域名必须提前配置
小程序只能访问已在 [mp.weixin.qq.com 后台](https://mp.weixin.qq.com) 配置了 request 合法域名的服务器，开发期间可在开发者工具中关闭域名校验。

---
# 十、快速参考：各平台 API 根域名

```plaintext

# 通用 API（公众号、服务号、小程序、开放平台）
https://api.weixin.qq.com/

# 小程序登录
POST https://api.weixin.qq.com/sns/jscode2session
  ?appid=APPID&secret=SECRET&js_code=CODE&grant_type=authorization_code

# 微信支付（APIv3）
https://api.mch.weixin.qq.com/

# 开放平台 OAuth
https://open.weixin.qq.com/connect/oauth2/authorize
https://open.weixin.qq.com/connect/qrconnect  # PC 扫码
```

---
# 十一、微信支付平台（pay.weixin.qq.com）
文档中心：[pay.weixin.qq.com/doc/v3/merchant](https://pay.weixin.qq.com/doc/v3/merchant/4012062524)  |  接入指引：[申请商户号](https://pay.weixin.qq.com/static/applyment_guide/applyment_index.shtml)
微信支付是独立于公众平台和开放平台的第四个核心平台，接入它需要同时准备好 mchid（商户号）和 AppID 两个凭证，然后将二者绑定。

## 1. 开通费用
<table header-row="true" header-column="false">
<tr>
<td>费用项</td>
<td>金额</td>
<td>说明</td>
</tr>
<tr>
<td>商户号（mchid）申请</td>
<td>免费</td>
<td>在 pay.weixin.qq.com 直接申请，无开户费</td>
</tr>
<tr>
<td>交易手续费（普通商户）</td>
<td>0.6% / 笔</td>
<td>官方标准费率，不收款不扣费</td>
</tr>
<tr>
<td>交易手续费（服务商模式）</td>
<td>低至 0.2% / 笔</td>
<td>通过官方合作服务商申请，微信以返点形式补贴服务商</td>
</tr>
<tr>
<td>AppID 绑定前提：微信认证</td>
<td>300 元 / 年</td>
<td>服务号、小程序、移动应用的认证费，是绑定商户号的前提条件</td>
</tr>
<tr>
<td>对公账户打款验证</td>
<td>0.01～1 元（退还）</td>
<td>企业入驻时验证对公账户，T+1 日原路退还，实际不花钱</td>
</tr>
</table>

> 💡 服务商费率机制：服务商并非吃费率差，而是靠微信官方返点盈利。公式：返点比例 = 交易结算费率 − 0.2%（费率 ≤ 0.2% 则返点 0.05%）。服务商额外收入来自收银系统、小程序商城等增值服务。参考：[服务商模式说明](https://pay.weixin.qq.com/doc/v3/merchant/4012068443)

## 2. 接入模式
官方文档：[接入模式说明](https://pay.weixin.qq.com/doc/v3/merchant/4012068443)
<table header-row="true" header-column="false">
<tr>
<td>模式</td>
<td>适用场景</td>
<td>核心特点</td>
<td>入驻入口</td>
</tr>
<tr>
<td>普通商户模式</td>
<td>自研系统、有开发能力的商户</td>
<td>资金直接结算到自己账户</td>
<td>[商户平台入驻](https://pay.weixin.qq.com/index.php/apply/applyment_home/guide_normal)</td>
</tr>
<tr>
<td>服务商模式</td>
<td>帮中小商户接入微信支付的服务商</td>
<td>通过子商户（特约商户）收款；服务商商户号本身不能直接收款</td>
<td>[服务商平台入驻](https://pay.weixin.qq.com/partner/public/home)</td>
</tr>
<tr>
<td>银行服务商</td>
<td>银行或大型渠道合作方</td>
<td>需与财付通签订协议，准入门槛高</td>
<td>需联系微信支付</td>
</tr>
</table>

## 3. 支付产品选型（按场景）
官方文档：[支付产品说明](https://pay.weixin.qq.com/doc/v3/merchant/4012068590)
<table header-row="true" header-column="false">
<tr>
<td>产品</td>
<td>场景</td>
<td>需要的 AppID 类型</td>
<td>认证要求</td>
<td>文档</td>
</tr>
<tr>
<td>JSAPI 支付（公众号支付）</td>
<td>微信内 H5 / 公众号页面</td>
<td>已认证的服务号 / 政府媒体公众号</td>
<td>服务号认证（300元/年）</td>
<td>[JSAPI 文档](https://pay.weixin.qq.com/doc/v3/merchant/4012062524)</td>
</tr>
<tr>
<td>H5 支付</td>
<td>手机浏览器（非微信内）网页</td>
<td>服务号 / 小程序 / 移动应用（三选一）</td>
<td>对应 AppID 认证（300元/年）</td>
<td>[H5 支付文档](https://pay.weixin.qq.com/doc/v3/merchant/4012065000)</td>
</tr>
<tr>
<td>Native 支付（扫码）</td>
<td>PC 网站、线下收款码</td>
<td>仅需商户号，不强依赖 AppID</td>
<td>商户号即可，无需额外 AppID 认证</td>
<td>[Native 文档](https://pay.weixin.qq.com/doc/v3/merchant/4012080323)</td>
</tr>
<tr>
<td>APP 支付</td>
<td>iOS / Android / 鸿蒙原生 App</td>
<td>开放平台移动应用 AppID</td>
<td>开放平台移动应用认证（300元/年）</td>
<td>[APP 支付文档](https://pay.weixin.qq.com/doc/v3/merchant/4012069357)</td>
</tr>
<tr>
<td>小程序支付</td>
<td>微信小程序内</td>
<td>小程序 AppID</td>
<td>小程序认证（300元/年）</td>
<td>[小程序支付文档](https://pay.weixin.qq.com/doc/v3/merchant/4012060248)</td>
</tr>
<tr>
<td>付款码支付（被扫）</td>
<td>线下扫用户付款码</td>
<td>商户号 + 扫码设备</td>
<td>申请付款码支付权限</td>
<td>[付款码文档](https://pay.weixin.qq.com/doc/v3/merchant/4012647301)</td>
</tr>
</table>

> ⚠️ H5 支付 vs JSAPI 支付容易混淆：JSAPI 在微信客户端内浏览器里调起，需服务号 AppID 获取 openid；H5 在手机外部浏览器（Safari/Chrome）里调起，跳转到微信 App 完成支付再跳回。两者 API 接口和参数完全不同，不能混用。

## 4. 完整申请流程：mchid 与 AppID
官方文档：[mchid 与 AppID 申请](https://pay.weixin.qq.com/doc/v3/merchant/4012071573)
申请 mchid 和 AppID 互不影响，可并行进行，最后再绑定。

### Step 1 — 申请商户号（mchid）
- 入口：[pay.weixin.qq.com → 接入微信支付 → 普通商户入驻](https://pay.weixin.qq.com/index.php/apply/applyment_home/guide_normal)
- 支持主体：个体工商户、企业、政府机关、事业单位、社会组织（注意：纯个人不支持）
- 审核通过后，联系邮箱会收到含 mchid 及登录账号密码的通知邮件
- ⚠️ 一个 mchid 只能对应一种结算币种；同一法人申请数量由系统风控策略动态分配

### Step 2 — 申请 AppID（按场景选载体）
- 服务号 → [mp.weixin.qq.com 注册](https://mp.weixin.qq.com) → 企业认证 300元/年（用于 JSAPI 支付）
- 小程序 → [mp.weixin.qq.com 注册](https://mp.weixin.qq.com) → 认证 300元/年（用于小程序支付）
- 移动应用 → [open.weixin.qq.com](https://open.weixin.qq.com) 注册开放平台 → [创建移动应用](https://developers.weixin.qq.com/doc/oplatform/Mobile_App/guideline/create.html) → 审核通过才有移动应用 AppID → 认证 300元/年（用于 APP 支付、H5 支付）

> ⚠️ 重要：open.weixin.qq.com 认证完成后，账号设置里的 AppID 是「开放平台账号本身的 ID」，不是移动应用的 AppID，不能用于绑定商户号。必须在开放平台内单独「[创建移动应用](https://developers.weixin.qq.com/doc/oplatform/Mobile_App/guideline/create.html)」并审核通过后，才会生成真正可绑定商户号的移动应用 AppID。两者是不同层级的凭证。

### Step 3 — 绑定 mchid 与 AppID
- 普通商户：登录商户平台 → 账户中心 → AppID 账号管理 → 关联 AppID
- 服务商：登录服务商平台 → 同上路径操作，绑定自己的 AppID 或子商户的 AppID
- 官方操作指引：[管理商户号绑定的 APPID 账号](https://pay.weixin.qq.com/doc/v3/merchant/4016328613)

## 5. APIv3 技术规范
官方文档：[APIv3 概述](https://pay.weixin.qq.com/doc/v3/merchant/4012081606)  |  [签名与验签说明](https://pay.weixin.qq.com/doc/v3/merchant/4012365342)
微信支付当前主推 APIv3，相比旧版 V2 的主要变化：
- 数据格式：XML → JSON
- 签名算法：MD5 / HMAC-SHA256 → SHA256-RSA（非对称密钥），需要商户 API 证书签名
- 验签方式（二选一）：微信支付公钥模式（推荐，按需更新）或平台证书模式（有效期 5 年，到期需更新）
- 敏感字段加密：AES-256-GCM 对回调关键信息加密
- 风格：遵循 REST 设计规范

### APIv3 根域名与关键端点

```plaintext

# 所有 APIv3 接口根域名
https://api.mch.weixin.qq.com/

# JSAPI / 小程序下单（appid 填对应 AppID）
POST https://api.mch.weixin.qq.com/v3/pay/transactions/jsapi

# H5 下单
POST https://api.mch.weixin.qq.com/v3/pay/transactions/h5

# Native 下单（返回 code_url 二维码）
POST https://api.mch.weixin.qq.com/v3/pay/transactions/native

# APP 下单
POST https://api.mch.weixin.qq.com/v3/pay/transactions/app

# 查询订单（微信订单号）
GET https://api.mch.weixin.qq.com/v3/pay/transactions/id/{transaction_id}

# 查询订单（商户订单号）
GET https://api.mch.weixin.qq.com/v3/pay/transactions/out-trade-no/{out_trade_no}

# 申请退款
POST https://api.mch.weixin.qq.com/v3/refund/domestic/refunds
```

### 官方 SDK（强烈推荐，封装签名/加密/验签）
Java SDK：[接入文档](https://pay.weixin.qq.com/doc/v3/merchant/4014931831)  |  Go SDK：[接入文档](https://pay.weixin.qq.com/doc/v3/merchant/4015119334)  |  GitHub：[wechatpay-apiv3](https://github.com/wechatpay-apiv3)  |  Postman 工具：[下载](https://pay.weixin.qq.com/doc/v3/merchant/4012076519)

### 开发必备凭证清单
<table header-row="true" header-column="false">
<tr>
<td>参数</td>
<td>作用</td>
<td>获取方式</td>
</tr>
<tr>
<td>AppID</td>
<td>标识支付载体（公众号 / 小程序 / 移动应用）</td>
<td>对应平台后台查看</td>
</tr>
<tr>
<td>mchid（商户号）</td>
<td>标识收款商户</td>
<td>入驻审核通过后邮件告知</td>
</tr>
<tr>
<td>API v3 密钥</td>
<td>敏感字段加解密</td>
<td>商户平台 → 账户中心 → API 安全 → 设置 API v3 密钥</td>
</tr>
<tr>
<td>商户 API 证书（私钥+证书序列号）</td>
<td>请求签名</td>
<td>商户平台 → 账户中心 → API 安全 → 申请 API 证书</td>
</tr>
<tr>
<td>微信支付公钥 / 平台证书</td>
<td>验证微信返回响应和回调的签名</td>
<td>推荐公钥模式；平台证书通过 API 下载</td>
</tr>
</table>

## 6. 微信支付接入常见坑

### 🚫 账号级 AppID ≠ 移动应用 AppID
- [open.weixin.qq.com](https://open.weixin.qq.com) 认证后账号设置里的 AppID 是开放平台账号本身的 ID，不能用于绑定商户号。必须额外「[创建移动应用](https://developers.weixin.qq.com/doc/oplatform/Mobile_App/guideline/create.html)」并审核通过后才有可用的移动应用 AppID。

### 🚫 服务商模式下子商户 AppID 是可选的
- 服务商用自己的 sp_appid 代子商户发起支付时，sub_appid 可以不传。但若传了 sub_appid，用户的 sub_openid 和 sp_openid 会同时返回，便于后续用户身份关联。参考：[参数说明](https://pay.weixin.qq.com/doc/v3/merchant/4012068676)

### 🚫 Native 支付不强依赖 AppID
- PC 网站展示收款二维码走 Native 支付，只需商户号即可下单生成 code_url 二维码，无需绑定 AppID。是 PC 场景接入成本最低的方式。参考：[Native 支付文档](https://pay.weixin.qq.com/doc/v3/merchant/4012080323)

### 🚫 支付回调必须做幂等处理
- 微信支付的支付成功通知（notify）可能重复推送，服务端必须以商户订单号做幂等判断，避免重复发货。参考：[回调和查单最佳实践](https://pay.weixin.qq.com/doc/v3/merchant/4012075249)

### 🚫 证书和密钥需要安全存储
- 商户 API 私钥（apiclient_key.pem）绝对不能提交到 Git 仓库或写入代码。建议用环境变量或密钥管理服务（KMS）存储。参考：[API 安全最佳实践](https://pay.weixin.qq.com/doc/v3/merchant/4012075249)

---
> 🗓️ 文档整理时间：2026 年 6 月 | 数据来源：[微信开放平台文档](https://developers.weixin.qq.com/doc/oplatform/open/intro.html) / [微信公众平台文档](https://mp.weixin.qq.com) / [微信支付文档中心](https://pay.weixin.qq.com/doc/v3/merchant/4012062524)
