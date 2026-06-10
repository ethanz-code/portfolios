---
title: "One API 主从架构分布式部署深度解析"
description: "说明 One API / New API 的主从架构、环境变量和 SYNC_FREQUENCY 同步机制。"
publishedDate: "2026-06-09"
updatedDate: "2026-06-09"
tags:
  - "One API"
  - "分布式部署"
  - "数据库"
---

# One API 主从架构分布式部署深度解析
> 本文基于 [songquanpeng/one-api](https://github.com/songquanpeng/one-api) 官方文档及 [New API 集群部署文档](https://www.newapi.ai/en/installation/cluster-deployment/) 整理，结合分布式系统通用原理展开说明。
---
## 一、整体架构概述
One API / New API 的多机部署采用**应用层主从架构**，而非数据库层主从复制。所有节点共用同一个 MySQL，区别在于职责分工不同：
```javascript
外部 API 请求
      ↓
[负载均衡 / Nginx]
   ↙         ↘
[从节点1]    [从节点2]    ← 扛流量，高配置，多部署
        ↖   ↗
      [MySQL 数据库]     ← 所有节点直连同一个库
        ↗
[主节点]                 ← 管理后台专用，配置较低，尽量少承接外部流量
```
**关键理解：**
- 主节点不是"流量入口"，而是"管理控制台"
- 从节点才是真正承接 API 请求的工作节点
- 写数据库（记录调用量、扣费等）由各节点直接写，不需要中转主节点
- 主节点的核心价值是**稳定可用**，一旦崩溃，配置管理就瘫痪
> 参考：[GeeksforGeeks - Master-Slave Architecture](https://www.geeksforgeeks.org/master-slave-architecture/)、[System Design 101 - Master-slave Architecture](https://link1905.github.io/system-design-101/data-persistence/distributed-database/master-slave-architecture/)
---
## 二、各环境变量详解
<table header-row="true">
<tr>
<td>变量</td>
<td>作用</td>
<td>建议</td>
</tr>
<tr>
<td>`SESSION_SECRET`</td>
<td>所有节点会话加密密钥，必须一致，否则登录态互不认</td>
<td>所有节点设为相同的随机长字符串</td>
</tr>
<tr>
<td>`SQL_DSN`</td>
<td>指向同一个 MySQL，所有节点共享数据</td>
<td>`user:pass@tcp(host:3306)/db?charset=utf8mb4`</td>
</tr>
<tr>
<td>`NODE_TYPE=slave`</td>
<td>从节点不启动管理写操作，只处理 API 请求</td>
<td>所有从节点必须设置</td>
</tr>
<tr>
<td>`SYNC_FREQUENCY`</td>
<td>定期从数据库同步配置到内存，保持数据新鲜</td>
<td>60\~600 秒，主从都推荐设置</td>
</tr>
<tr>
<td>`REDIS_CONN_STRING`</td>
<td>接入 Redis，请求优先读 Redis，减少数据库压力</td>
<td>每台节点本地 Redis 或共享 Redis</td>
</tr>
<tr>
<td>`FRONTEND_BASE_URL`</td>
<td>从节点收到页面请求时重定向到主节点</td>
<td>设为主节点的 URL</td>
</tr>
</table>
---
## 三、SYNC_FREQUENCY 深度解析
### 3.1 为什么内存缓存会过时？
服务器启动时，会将数据库中的配置（渠道列表、Token 限额、系统设置等）**加载到内存**，之后直接读内存，不再每次查库。
问题在于：
```javascript
管理员在主节点后台禁用了某个渠道
        ↓
MySQL 数据已更新
        ↓
从节点内存里该渠道还是启用状态（因为只在启动时加载过一次）
        ↓
从节点继续把请求转发给已禁用渠道 → 报错 / 浪费配额
        ↓
只有重启从节点才能解决
```
### 3.2 SYNC_FREQUENCY 怎么生效？
设置后，服务内部启动一个**定时器后台协程**，定期拉取数据库中最新配置覆盖内存。伪代码逻辑如下：
```go
// Go 伪代码（参考 one-api 内部实现思路）
func StartSyncConfig(intervalSeconds int) {
    ticker := time.NewTicker(time.Duration(intervalSeconds) * time.Second)
    go func() {
        for range ticker.C {
            configs := db.LoadAllConfigs()   // 查数据库
            memory.UpdateConfigs(configs)    // 更新内存
        }
    }()
}
```
本质是：用**轻微的数据延迟**（最多 N 秒）换取**极低的数据库访问压力**。
### 3.3 配合 Redis 的完整请求链路
```javascript
请求进来
    ↓
先查 Redis（毫秒级）
    ├── 命中 → 直接返回，数据库零访问 ✅
    └── 未命中
            ↓
        读内存缓存（SYNC_FREQUENCY 保持同步）
            ↓
        结果写入 Redis（设置 TTL 过期时间）
            ↓
        返回结果
```
> 参考：[NestJS 官方 Caching 文档](https://docs.nestjs.com/techniques/caching)、[oneuptime.com](http://oneuptime.com)[ - How to Implement Caching in NestJS](https://oneuptime.com/blog/post/2026-02-02-nestjs-caching/view)
---
## 四、NestJS + TypeORM 简单案例
以下代码模拟这套架构中的核心模式：**定时同步配置到内存 + Redis 缓存层**。
### 4.1 安装依赖
```bash
npm install @nestjs/cache-manager cache-manager ioredis @nestjs/schedule @nestjs/typeorm typeorm mysql2
```
### 4.2 配置实体（Config Entity）
```typescript
// config.entity.ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('system_configs')
export class SystemConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  key: string;

  @Column('text')
  value: string;

  @Column({ name: 'updated_at' })
  updatedAt: Date;
}
```
### 4.3 内存配置 Store（模拟 one-api 内存缓存）
```typescript
// config-store.service.ts
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ConfigStoreService {
  private readonly logger = new Logger(ConfigStoreService.name);
  private store = new Map<string, string>();

  set(key: string, value: string) {
    this.store.set(key, value);
  }

  get(key: string): string | undefined {
    return this.store.get(key);
  }

  bulkUpdate(configs: Record<string, string>) {
    for (const [k, v] of Object.entries(configs)) {
      this.store.set(k, v);
    }
    this.logger.log(`内存配置已同步，共 ${Object.keys(configs).length} 项`);
  }

  getAll(): Record<string, string> {
    return Object.fromEntries(this.store);
  }
}
```
### 4.4 定时同步服务（模拟 SYNC_FREQUENCY）
```typescript
// config-sync.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemConfig } from './config.entity';
import { ConfigStoreService } from './config-store.service';

@Injectable()
export class ConfigSyncService {
  private readonly logger = new Logger(ConfigSyncService.name);

  constructor(
    @InjectRepository(SystemConfig)
    private readonly configRepo: Repository<SystemConfig>,
    private readonly configStore: ConfigStoreService,
  ) {}

  // 模拟 SYNC_FREQUENCY=60，每 60 秒从数据库同步一次
  @Cron('*/60 * * * * *')
  async syncFromDatabase() {
    this.logger.log('开始从数据库同步配置...');
    try {
      const configs = await this.configRepo.find();
      const map: Record<string, string> = {};
      for (const c of configs) {
        map[c.key] = c.value;
      }
      this.configStore.bulkUpdate(map);
    } catch (err) {
      this.logger.error('同步配置失败', err);
    }
  }

  // 服务启动时立即同步一次
  async onModuleInit() {
    await this.syncFromDatabase();
  }
}
```
### 4.5 配置读取服务（Redis 缓存 + 内存兜底）
```typescript
// config.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ConfigStoreService } from './config-store.service';

@Injectable()
export class ConfigService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private configStore: ConfigStoreService,
  ) {}

  async getConfig(key: string): Promise<string | null> {
    // 第一层：查 Redis
    const cached = await this.cacheManager.get<string>(`config:${key}`);
    if (cached !== null && cached !== undefined) {
      return cached;
    }

    // 第二层：读内存（由 SYNC_FREQUENCY 定时保持同步）
    const memValue = this.configStore.get(key);
    if (memValue !== undefined) {
      // 写入 Redis，TTL 60s
      await this.cacheManager.set(`config:${key}`, memValue, 60000);
      return memValue;
    }

    return null;
  }
}
```
### 4.6 模块装配
```typescript
// config.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { CacheModule } from '@nestjs/cache-manager';
import { SystemConfig } from './config.entity';
import { ConfigStoreService } from './config-store.service';
import { ConfigSyncService } from './config-sync.service';
import { ConfigService } from './config.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([SystemConfig]),
    CacheModule.register({
      // 生产环境替换为 Redis store
      ttl: 60000,
    }),
  ],
  providers: [ConfigStoreService, ConfigSyncService, ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
```
### 4.7 完整读取流程图
```javascript
getConfig("channel_enabled")
         ↓
  查 Redis (cache:config:channel_enabled)
         ├── 命中 → 直接返回 ✅
         └── 未命中
                  ↓
          读 ConfigStoreService (内存 Map)
          （由 @Cron 每60s从DB同步）
                  ├── 命中 → 写入Redis → 返回 ✅
                  └── 未命中 → 返回 null
```
---
## 五、参考资料
- [one-api GitHub README](https://github.com/songquanpeng/one-api/blob/main/README.en.md)
- [New API 集群部署文档](https://www.newapi.ai/en/installation/cluster-deployment/)
- [DeepWiki - one-api 系统架构](https://deepwiki.com/songquanpeng/one-api/1-overview)
- [GeeksforGeeks - Master-Slave Architecture](https://www.geeksforgeeks.org/master-slave-architecture/)
- [Medium - Master–Slave Syncing in Distributed Systems](https://codechefvaibhavkashyap.medium.com/master-slave-syncing-in-distributed-systems-how-leaders-and-followers-achieve-strong-consistency-7c140e4de3cd)
- [NestJS 官方 Caching 文档](https://docs.nestjs.com/techniques/caching)
- [oneuptime.com](http://oneuptime.com)[ - How to Implement Caching in NestJS](https://oneuptime.com/blog/post/2026-02-02-nestjs-caching/view)
- [WorkOS - Query caching using NestJS and TypeORM](https://workos.com/blog/query-caching-nest-js-and-typeorm)
- [wanago.io](http://wanago.io)[ - API with NestJS: In-memory cache](https://wanago.io/2021/01/04/api-nestjs-in-memory-cache-performance/)
