import { describe, it, expect } from 'vitest';
import { extractSqlBlocksFromMarkdown } from '../utils/sql/extractSqlBlocks';
import { parseSqlMeta } from '../utils/sql/parseSqlMeta';

describe('parseSqlMeta', () => {
	it('应该识别 SQL 代码块', () => {
		const result = parseSqlMeta('sql', '');
		expect(result.isSql).toBe(true);
	});

	it('应该识别不同 SQL 方言', () => {
		const dialects = ['sql', 'pgsql', 'mysql', 'sqlite', 'tsql', 'plsql'];
		for (const dialect of dialects) {
			const result = parseSqlMeta(dialect, '');
			expect(result.isSql).toBe(true);
		}
	});

	it('应该识别非 SQL 代码块', () => {
		const result = parseSqlMeta('javascript', '');
		expect(result.isSql).toBe(false);
		expect(result.isExecutable).toBe(false);
	});

	it('应该解析 role=final', () => {
		const result = parseSqlMeta('sql', '{ role=final }');
		expect(result.role).toBe('final');
		expect(result.isExecutable).toBe(true); // role=final 自动可执行
	});

	it('应该解析 role=intermediate', () => {
		const result = parseSqlMeta('sql', '{ role=intermediate }');
		expect(result.role).toBe('intermediate');
		expect(result.isExecutable).toBe(false);
	});

	it('应该解析 executable=true', () => {
		const result = parseSqlMeta('sql', '{ role=intermediate executable=true }');
		expect(result.role).toBe('intermediate');
		expect(result.isExecutable).toBe(true);
	});

	it('应该解析 executable=false', () => {
		const result = parseSqlMeta('sql', '{ role=final executable=false }');
		expect(result.role).toBe('final');
		expect(result.isExecutable).toBe(false); // 显式设置覆盖默认规则
	});

	it('应该处理没有 metastring 的情况', () => {
		const result = parseSqlMeta('sql', '');
		expect(result.isSql).toBe(true);
		expect(result.role).toBeUndefined();
		expect(result.isExecutable).toBe(false);
	});

	it('应该处理不规范的 metastring', () => {
		const result = parseSqlMeta('sql', 'invalid');
		expect(result.isSql).toBe(true);
		expect(result.role).toBeUndefined();
		expect(result.isExecutable).toBe(false);
	});
});

describe('extractSqlBlocksFromMarkdown', () => {
	it('应该提取带 role=final 的 SQL 块', () => {
		const markdown = `
\`\`\`sql { role=final }
select * from users;
\`\`\`
    `;
		const blocks = extractSqlBlocksFromMarkdown(markdown);

		expect(blocks).toHaveLength(1);
		expect(blocks[0]).toMatchObject({
			content: 'select * from users;',
			isExecutable: true,
			role: 'final',
			lang: 'sql',
		});
		expect(blocks[0].blockId).toBeDefined();
	});

	it('应该正确解析 executable=false', () => {
		const markdown = `
\`\`\`sql { role=intermediate executable=false }
select count(*) from users;
\`\`\`
    `;
		const blocks = extractSqlBlocksFromMarkdown(markdown);

		expect(blocks[0].isExecutable).toBe(false);
		expect(blocks[0].role).toBe('intermediate');
	});

	it('应该支持多个 SQL 块', () => {
		const markdown = `
\`\`\`sql { role=init }
create table users (id int);
\`\`\`

一些文本

\`\`\`sql { role=final }
select * from users;
\`\`\`
    `;
		const blocks = extractSqlBlocksFromMarkdown(markdown);

		expect(blocks).toHaveLength(2);
		expect(blocks[0].role).toBe('init');
		expect(blocks[0].content).toBe('create table users (id int);');
		expect(blocks[1].role).toBe('final');
		expect(blocks[1].content).toBe('select * from users;');
	});

	it('应该识别不同 SQL 方言', () => {
		const markdown = `
\`\`\`pgsql { role=final }
select * from users;
\`\`\`

\`\`\`mysql { role=final }
select * from users;
\`\`\`

\`\`\`sqlite { role=final }
select * from users;
\`\`\`
    `;
		const blocks = extractSqlBlocksFromMarkdown(markdown);

		expect(blocks).toHaveLength(3);
		expect(blocks[0].lang).toBe('pgsql');
		expect(blocks[1].lang).toBe('mysql');
		expect(blocks[2].lang).toBe('sqlite');
	});

	it('应该忽略非 SQL 代码块', () => {
		const markdown = `
\`\`\`javascript
console.log('hello');
\`\`\`

\`\`\`sql { role=final }
select 1;
\`\`\`

\`\`\`python
print('world')
\`\`\`
    `;
		const blocks = extractSqlBlocksFromMarkdown(markdown);

		expect(blocks).toHaveLength(1);
		expect(blocks[0].lang).toBe('sql');
		expect(blocks[0].content).toBe('select 1;');
	});

	it('应该生成唯一 blockId', () => {
		const markdown = `
\`\`\`sql { role=final }
select 1;
\`\`\`

\`\`\`sql { role=final }
select 2;
\`\`\`

\`\`\`sql { role=final }
select 3;
\`\`\`
    `;
		const blocks = extractSqlBlocksFromMarkdown(markdown);

		expect(blocks).toHaveLength(3);
		expect(blocks[0].blockId).not.toBe(blocks[1].blockId);
		expect(blocks[1].blockId).not.toBe(blocks[2].blockId);
		expect(blocks[0].blockId).not.toBe(blocks[2].blockId);
	});

	it('应该正确提取行号信息', () => {
		const markdown = `line 1
\`\`\`sql { role=final }
select * from users;
\`\`\`
line 5`;
		const blocks = extractSqlBlocksFromMarkdown(markdown);

		expect(blocks[0].startLine).toBe(2);
		expect(blocks[0].endLine).toBe(4);
	});

	it('应该处理空 Markdown', () => {
		const blocks = extractSqlBlocksFromMarkdown('');
		expect(blocks).toHaveLength(0);
	});

	it('应该处理只有普通文本的 Markdown', () => {
		const markdown = `
# Title

This is a paragraph.

- List item 1
- List item 2
    `;
		const blocks = extractSqlBlocksFromMarkdown(markdown);
		expect(blocks).toHaveLength(0);
	});

	it('应该处理没有 metastring 的 SQL 代码块', () => {
		const markdown = `
\`\`\`sql
select * from users;
\`\`\`
    `;
		const blocks = extractSqlBlocksFromMarkdown(markdown);

		expect(blocks).toHaveLength(1);
		expect(blocks[0].role).toBeUndefined();
		expect(blocks[0].isExecutable).toBe(false);
		expect(blocks[0].content).toBe('select * from users;');
	});

	it('应该支持 GFM 特性（如表格）混合 SQL 块', () => {
		const markdown = `
| Column 1 | Column 2 |
|----------|----------|
| Value 1  | Value 2  |

\`\`\`sql { role=final }
select * from users;
\`\`\`

**Bold text**

\`\`\`sql { role=intermediate }
select count(*);
\`\`\`
    `;
		const blocks = extractSqlBlocksFromMarkdown(markdown);

		expect(blocks).toHaveLength(2);
		expect(blocks[0].role).toBe('final');
		expect(blocks[1].role).toBe('intermediate');
	});

	it('应该正确处理多行 SQL 内容', () => {
		const markdown = `
\`\`\`sql { role=final }
select
  u.id,
  u.name,
  u.email
from users u
where u.status = 'active'
  and u.created_at > '2024-01-01'
order by u.created_at desc
limit 10;
\`\`\`
    `;
		const blocks = extractSqlBlocksFromMarkdown(markdown);

		expect(blocks).toHaveLength(1);
		expect(blocks[0].content).toContain('select');
		expect(blocks[0].content).toContain('from users u');
		expect(blocks[0].content).toContain('limit 10;');
	});

	it('应该支持自定义 role 值', () => {
		const markdown = `
\`\`\`sql { role=migration }
alter table users add column verified boolean;
\`\`\`

\`\`\`sql { role=rollback }
alter table users drop column verified;
\`\`\`
    `;
		const blocks = extractSqlBlocksFromMarkdown(markdown);

		expect(blocks).toHaveLength(2);
		expect(blocks[0].role).toBe('migration');
		expect(blocks[1].role).toBe('rollback');
	});
});
