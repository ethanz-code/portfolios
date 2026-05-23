---
title: "数据库事务：BEGIN 和 COMMIT 的作用"
description: "把多条 SQL 打包成一个原子操作，避免数据停在半更新状态。"
publishedDate: "2026-05-19"
tags:
  - "数据库"
  - "事务"
---

`BEGIN ... COMMIT` 是把一组数据库操作包裹成一个事务，让它们作为一个整体执行。

## BEGIN 是什么

`BEGIN` 表示开始一个事务。

从这条语句之后，到事务结束之前，数据库会把后续操作视为同一组逻辑操作。

## COMMIT 是什么

`COMMIT` 表示提交事务，也就是确认把 `BEGIN` 之后的修改正式写入数据库并生效。

## 为什么要这样包裹

事务主要解决三件事：

- 保证原子性：一组操作要么全部成功，要么失败时全部撤回。
- 避免半更新状态：防止执行到一半出错，导致数据只改了一部分。
- 保证业务一致性：适用于转账、下单、库存扣减等必须整体成功的场景。

## 例子：转账

```sql
BEGIN;

UPDATE account SET balance = balance - 100 WHERE id = 1;
UPDATE account SET balance = balance + 100 WHERE id = 2;

COMMIT;
```

这表示账户 1 扣 100，账户 2 加 100。这两个动作必须一起成功。

如果中间任何一步失败，就不应该 `COMMIT`，而应该执行：

```sql
ROLLBACK;
```

`ROLLBACK` 会撤销本次事务中已经执行但尚未提交的修改。

## 失败后会不会影响其他增删改查

通常不会影响整个数据库，也不会影响其他连接上的正常查询。

但它会影响当前事务所在的连接。如果事务里某条 SQL 失败后没有及时 `ROLLBACK`，这个连接可能会继续处在错误事务状态，后续 SQL 也可能失败，甚至持有锁不释放。

应用代码里要把事务包进 `try / catch`：

```ts
await client.query("BEGIN");

try {
  await client.query("UPDATE account SET balance = balance - 100 WHERE id = $1", [fromId]);
  await client.query("UPDATE account SET balance = balance + 100 WHERE id = $1", [toId]);
  await client.query("COMMIT");
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
}
```

这段代码的重点不是语法，而是失败路径。只要事务失败，就先回滚，再把错误交给上层处理。

## 总结

`BEGIN ... COMMIT` 的核心意义是：把多条 SQL 打包成一个可靠的原子操作，确保数据不会停留在不完整、不一致的状态。
