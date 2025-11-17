/**
 * SQL 代码块提取示例
 *
 * 展示如何从 AI 生成的 Markdown 响应中提取和识别 SQL 代码块
 */

import { extractSqlBlocksFromMarkdown } from '../src/utils/sql/extractSqlBlocks';

// 模拟 AI 生成的 SQL 分析响应
const aiResponse = `
我来帮你分析这个问题。

首先，让我看看用户表的统计信息：

\`\`\`sql { role=intermediate }
-- 中间分析 SQL
select count(*) as total_users,
       count(case when status='active' then 1 end) as active_users
from users;
\`\`\`

基于上面的分析，这是最终的查询：

\`\`\`sql { role=final }
-- 最终可执行 SQL
select
  u.id,
  u.name,
  u.email,
  u.created_at
from users u
where u.status = 'active'
  and u.created_at > '2024-01-01'
order by u.created_at desc
limit 10;
\`\`\`

这个查询会返回最近 10 个活跃用户。
`;

// 提取所有 SQL 块
const blocks = extractSqlBlocksFromMarkdown(aiResponse);

console.log('找到 SQL 块数量:', blocks.length);
console.log('\\n所有 SQL 块详情:');
console.log(JSON.stringify(blocks, null, 2));

// 场景 1: 自动识别并执行"最终 SQL"
console.log('\\n=== 场景 1: 自动执行最终 SQL ===');
const finalSql = blocks.find((b) => b.role === 'final' && b.isExecutable);
if (finalSql) {
	console.log('找到最终可执行 SQL:');
	console.log('Block ID:', finalSql.blockId);
	console.log('行号范围:', `${finalSql.startLine}-${finalSql.endLine}`);
	console.log('SQL 内容:\\n', finalSql.content);
	// 实际应用中，这里会执行 SQL
	// await db.execute(finalSql.content);
}

// 场景 2: 列出所有可用的 SQL 块供用户选择
console.log('\\n=== 场景 2: 列出所有 SQL 块 ===');
for (const block of blocks) {
	console.log(`- [${block.role || 'unknown'}] ${block.isExecutable ? '✓' : '✗'} 可执行`);
	console.log(`  位置: ${block.startLine}-${block.endLine}`);
	console.log(`  前 50 字符: ${block.content.slice(0, 50)}...`);
}

// 场景 3: 区分不同方言的 SQL
console.log('\\n=== 场景 3: 多方言处理 ===');
const multiDialectResponse = `
\`\`\`pgsql { role=final }
SELECT * FROM users WHERE created_at > NOW() - INTERVAL '7 days';
\`\`\`

\`\`\`mysql { role=final }
SELECT * FROM users WHERE created_at > DATE_SUB(NOW(), INTERVAL 7 DAY);
\`\`\`
`;

const dialectBlocks = extractSqlBlocksFromMarkdown(multiDialectResponse);
for (const block of dialectBlocks) {
	console.log(`方言: ${block.lang}, 内容: ${block.content.slice(0, 50)}...`);
	// 根据方言选择不同的执行引擎
	// if (block.lang === 'pgsql') await postgresClient.execute(block.content);
	// else if (block.lang === 'mysql') await mysqlClient.execute(block.content);
}
