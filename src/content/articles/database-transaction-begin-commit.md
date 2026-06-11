---
title: "数据库事务：BEGIN 和 COMMIT 的作用"
description: "从 ACID、锁、失败回滚和连接状态理解 BEGIN/COMMIT 的工程意义。"
publishedDate: "2026-05-19"
updatedDate: "2026-06-09"
tags:
  - "数据库"
  - "事务"
  - "后端"
---

> 📌 整理来源：PostgreSQL 官方文档（postgresql.org/docs/current/tutorial-transactions.html）、MySQL 官方文档（dev.mysql.com）— 2026 年 6 月

> 💡 一句话理解：BEGIN ... COMMIT 把一组数据库操作包裹成一个原子整体——要么全部成功落库，要么全部撤销，不存在中间状态。

---
## 一、事务的四个性质（ACID）
官方说明：[PostgreSQL 文档 — Transactions](https://www.postgresql.org/docs/current/tutorial-transactions.html)
<table header-row="true" header-column="false">
<tr>
<td>性质</td>
<td>说明</td>
</tr>
<tr>
<td>原子性（Atomicity）</td>
<td>事务内所有操作是一个整体，不允许部分成功</td>
</tr>
<tr>
<td>一致性（Consistency）</td>
<td>事务执行前后，数据库始终处于合法状态（满足所有约束）</td>
</tr>
<tr>
<td>隔离性（Isolation）</td>
<td>并发事务之间互不干扰，一个事务的中间状态对其他事务不可见</td>
</tr>
<tr>
<td>持久性（Durability）</td>
<td>COMMIT 之后，修改永久写入，即使数据库崩溃也不会丢失</td>
</tr>
</table>

---
## 二、BEGIN / COMMIT / ROLLBACK 基本语法
```sql
BEGIN;         -- 开启事务，后续操作进入同一个事务上下文

UPDATE ...;   -- 修改操作 1
INSERT ...;   -- 修改操作 2

COMMIT;        -- 提交：把所有修改持久化到数据库

-- 如果中间某步出错，执行 ROLLBACK 而不是 COMMIT：
ROLLBACK;     -- 撤销本次事务中所有尚未提交的修改
```
COMMIT 之前，所有修改只在当前事务内可见（取决于隔离级别），对其他连接来说这些数据还没变。

---
## 三、经典例子：转账
```sql
BEGIN;

UPDATE account SET balance = balance - 100 WHERE id = 1;
UPDATE account SET balance = balance + 100 WHERE id = 2;

COMMIT;

-- 如果第二条 UPDATE 失败：
ROLLBACK;  -- 第一条 UPDATE 也会被撤销，账户余额回到原始状态
```

---
## 四、工程里真正容易踩的坑

### 🚫 坑 1：忘记显式开启事务（autocommit 陷阱）
PostgreSQL、MySQL 默认开启 `autocommit`，每条 SQL 语句执行完立刻提交。如果没写 BEGIN，两条 UPDATE 分别是两个独立事务，第一条成功第二条失败时，第一条**不会自动回滚**。
```typescript
// ❌ 危险：没有事务包裹，两条操作不是原子的
await db.query('UPDATE account SET balance = balance - 100 WHERE id = 1');
await db.query('UPDATE account SET balance = balance + 100 WHERE id = 2');

// ✅ 正确：显式事务（以 node-postgres 为例）
const client = await pool.connect();
try {
  await client.query('BEGIN');
  await client.query('UPDATE account SET balance = balance - 100 WHERE id = 1');
  await client.query('UPDATE account SET balance = balance + 100 WHERE id = 2');
  await client.query('COMMIT');
} catch (e) {
  await client.query('ROLLBACK');
  throw e;
} finally {
  client.release();
}
```

### 🚫 坑 2：事务里做了耗时操作
事务持有期间会锁定相关行，持续时间越长，并发冲突越严重。常见误区是在事务里调外部 API、发邮件、等待 IO：
```typescript
// ❌ 危险：事务持有锁期间调了外部接口，可能等几秒
await client.query('BEGIN');
await client.query('UPDATE orders SET status = ? WHERE id = ?', ['paid', orderId]);
await sendEmailNotification(user.email);  // 可能超时，事务一直挂着
await client.query('COMMIT');

// ✅ 正确：先提交事务，再做副作用
await client.query('BEGIN');
await client.query('UPDATE orders SET status = ? WHERE id = ?', ['paid', orderId]);
await client.query('COMMIT');
await sendEmailNotification(user.email);  // 事务已结束，锁已释放
```

### 🚫 坑 3：COMMIT 之后才抛错，误以为需要 ROLLBACK
COMMIT 成功就意味着数据已持久化，之后再抛出的业务异常不会也不应该回滚。已提交的数据需要用业务补偿逻辑（如写一条反向记录）来处理，而不是 ROLLBACK。

### 🚫 坑 4：嵌套事务（PostgreSQL SAVEPOINT）
PostgreSQL 不支持真正的嵌套事务。在已有事务里再执行 BEGIN，会触发警告并忽略内层 BEGIN。需要部分回滚时，应使用 `SAVEPOINT`：
```sql
BEGIN;

UPDATE account SET balance = balance - 100 WHERE id = 1;

SAVEPOINT before_credit;  -- 设置存档点

UPDATE account SET balance = balance + 100 WHERE id = 2;

-- 如果这一步出问题，只回滚到存档点，不影响前面的扣款
ROLLBACK TO SAVEPOINT before_credit;

COMMIT;
```

---
## 五、隔离级别对比
官方文档：[PostgreSQL 隔离级别](https://www.postgresql.org/docs/current/transaction-iso.html)
<table header-row="true" header-column="false">
<tr>
<td>隔离级别</td>
<td>脏读</td>
<td>不可重复读</td>
<td>幻读</td>
</tr>
<tr>
<td>READ UNCOMMITTED</td>
<td>可能</td>
<td>可能</td>
<td>可能</td>
</tr>
<tr>
<td>READ COMMITTED（PostgreSQL 默认）</td>
<td>不会</td>
<td>可能</td>
<td>可能</td>
</tr>
<tr>
<td>REPEATABLE READ（MySQL InnoDB 默认）</td>
<td>不会</td>
<td>不会</td>
<td>可能</td>
</tr>
<tr>
<td>SERIALIZABLE</td>
<td>不会</td>
<td>不会</td>
<td>不会</td>
</tr>
</table>
大多数业务场景用默认值即可。金融场景可以考虑 SERIALIZABLE 或用乐观锁/悲观锁补充保证。

---
## 六、与 ORM 框架结合时的注意事项
TypeORM、Prisma、Sequelize 等框架底层仍然是 BEGIN/COMMIT/ROLLBACK。关键规则：使用 `manager.transaction()` 或 `$transaction()` 时，回调内的所有操作必须使用同一个 `manager` 或 `tx` 实例，不能混用外部实例，否则操作不在同一个事务里。
```typescript
// TypeORM 示例：正确用法
await dataSource.manager.transaction(async (manager) => {
  await manager.save(order);         // ✅ 使用事务内的 manager
  await manager.save(payment);       // ✅ 同一个事务
});

// ❌ 错误：用了外部 repository，不在同一个事务
await dataSource.manager.transaction(async (manager) => {
  await orderRepository.save(order);    // 这个 repo 用的是不同连接
  await manager.save(payment);
});
```

---
## 七、后续延伸阅读
- 长事务在高并发场景下的锁等待和死锁检测：[PostgreSQL 死锁文档](https://www.postgresql.org/docs/current/explicit-locking.html)
- PostgreSQL MVCC 实现原理：[MVCC 文档](https://www.postgresql.org/docs/current/mvcc-intro.html)
- Prisma Interactive Transaction vs Batch Transaction：[Prisma 事务文档](https://www.prisma.io/docs/orm/prisma-client/queries/transactions)

---
> 🗓️ 文档整理时间：2026 年 6 月 | 来源：[PostgreSQL 官方文档](https://www.postgresql.org/docs/current/tutorial-transactions.html) / [MySQL 官方文档](https://dev.mysql.com/doc/refman/8.0/en/commit.html)
