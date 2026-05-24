---
title: "数据库事务：BEGIN 和 COMMIT 的作用"
description: "从 ACID、锁、失败回滚和连接状态理解 BEGIN/COMMIT 的工程意义。"
publishedDate: "2026-05-19"
updatedDate: "2026-05-23"
tags:
  - "数据库"
  - "事务"
  - "后端"
---

## 一句话理解
`BEGIN ... COMMIT` 把一组数据库操作包裹成一个事务，让它们作为原子整体执行——要么全部成功落库，要么全部撤销，不存在中间状态。
---
## 事务的四个性质（ACID）
理解 BEGIN/COMMIT 之前，先把事务本身的承诺说清楚：
- **原子性（Atomicity）**：事务内所有操作是一个整体，不允许部分成功。
- **一致性（Consistency）**：事务执行前后，数据库始终处于合法状态（满足所有约束）。
- **隔离性（Isolation）**：并发事务之间互不干扰，一个事务的中间状态对其他事务不可见。
- **持久性（Durability）**：COMMIT 之后，修改永久写入，即使数据库崩溃也不会丢失。
---
## BEGIN / COMMIT / ROLLBACK 是什么
```sql
BEGIN;         -- 开启事务，后续操作进入同一个事务上下文

UPDATE ...;   -- 修改操作 1
INSERT ...;   -- 修改操作 2

COMMIT;        -- 提交：把所有修改持久化到数据库
```
如果中间某步出错，不应该 COMMIT，而应该执行：
```sql
ROLLBACK;     -- 撤销本次事务中所有尚未提交的修改
```
**COMMIT 之前，所有修改只在当前事务内可见**（取决于隔离级别），对其他连接来说这些数据还没变。
---
## 经典例子：转账
```sql
BEGIN;

UPDATE account SET balance = balance - 100 WHERE id = 1;
UPDATE account SET balance = balance + 100 WHERE id = 2;

COMMIT;
```
两条 UPDATE 必须同时成功，否则钱就凭空消失或凭空产生。如果第二条失败了：
```sql
ROLLBACK;  -- 第一条 UPDATE 也会被撤销，账户余额回到原始状态
```
---
## 工程里真正容易踩的坑
### 1. 忘记显式开启事务
很多数据库（包括 PostgreSQL、MySQL）默认开启**自动提交（autocommit）**，每条 SQL 语句执行完立刻提交。这意味着如果你没写 BEGIN，两条 UPDATE 分别是两个独立事务，第一条成功第二条失败时，第一条**不会自动回滚**。
```typescript
// ❌ 危险：没有事务包裹，两条操作不是原子的
await db.query('UPDATE account SET balance = balance - 100 WHERE id = 1');
await db.query('UPDATE account SET balance = balance + 100 WHERE id = 2');

// ✅ 正确：显式事务
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
### 2. 事务里做了耗时操作
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
### 3. COMMIT 之后才抛错，误以为需要 ROLLBACK
COMMIT 成功就意味着数据已持久化，之后再抛出的业务异常**不会也不应该回滚**。已提交的数据需要用业务补偿逻辑（比如写一条反向记录）来处理，而不是 ROLLBACK。
### 4. 嵌套事务的陷阱（以 PostgreSQL 为例）
PostgreSQL 不支持真正的嵌套事务。在已有事务里再执行 BEGIN，会触发警告并忽略内层 BEGIN。如果需要部分回滚，应该用 **SAVEPOINT**：
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
## 隔离级别与事务的关系
事务的隔离性不是二元的，数据库提供不同级别，级别越高越安全，并发性能越低：
<table header-row="true">
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
<td>READ COMMITTED</td>
<td>不会</td>
<td>可能</td>
<td>可能</td>
</tr>
<tr>
<td>REPEATABLE READ</td>
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
PostgreSQL 默认是 READ COMMITTED，MySQL InnoDB 默认是 REPEATABLE READ。大多数业务场景用默认值即可，金融场景可以考虑 SERIALIZABLE 或者用乐观锁/悲观锁补充保证。
---
## 与 ORM 框架结合时的注意事项
TypeORM、Prisma、Sequelize 等框架通常封装了事务 API，但底层仍然是 BEGIN/COMMIT/ROLLBACK。要注意：
- 框架的事务方法通常会自动在异常时 ROLLBACK，但要确认你用的版本的行为。
- 连接池场景下，事务必须绑定到同一个连接（connection），不能跨连接。
- 使用 `manager.transaction()` 或 `$transaction()` 时，传入的所有操作必须使用回调内的 `manager` 或 `tx`，不能用外部实例，否则操作不在同一个事务里。
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
## 后续待验证
- 长事务在高并发场景下的锁等待和死锁检测机制
- PostgreSQL MVCC 的具体实现：事务内的快照是怎么生成的
- Prisma `$transaction` 的 interactive transaction 和 batch transaction 区别
