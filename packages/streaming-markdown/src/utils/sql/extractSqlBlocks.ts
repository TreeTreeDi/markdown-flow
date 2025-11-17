import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import { visit } from 'unist-util-visit';
import type { Root } from 'mdast';
import { remarkSqlMarker } from '../../plugins/remarkSqlMarker';
import type { SqlBlock, SqlCodeNode } from '../../types/sqlBlock';

/**
 * 从 Markdown 文本提取 SQL 代码块
 *
 * 该函数解析 Markdown 文本为 AST，通过 remarkSqlMarker 插件标记 SQL 代码块，
 * 然后收集所有带 SQL 元信息的代码块并返回结构化数据。
 *
 * @param source - Markdown 文本
 * @returns SQL 代码块数组
 *
 * @example
 * const markdown = `
 * \`\`\`sql { role=final }
 * select * from users;
 * \`\`\`
 * `;
 * const blocks = extractSqlBlocksFromMarkdown(markdown);
 * // => [{
 * //   blockId: 'sql-2-1',
 * //   content: 'select * from users;',
 * //   isExecutable: true,
 * //   role: 'final',
 * //   lang: 'sql',
 * //   ...
 * // }]
 *
 * @example
 * // 提取最终可执行 SQL
 * const blocks = extractSqlBlocksFromMarkdown(aiResponse);
 * const finalSql = blocks.find(b => b.role === 'final' && b.isExecutable);
 * if (finalSql) {
 *   await db.execute(finalSql.content);
 * }
 */
export function extractSqlBlocksFromMarkdown(source: string): SqlBlock[] {
	// 1. 解析 Markdown → AST
	const processor = unified()
		.use(remarkParse)
		.use(remarkGfm)
		.use(remarkSqlMarker);

	const ast = processor.parse(source);
	const transformedAst = processor.runSync(ast) as Root;

	// 2. 收集 SQL 块
	return collectSqlBlocks(transformedAst);
}

/**
 * 从 AST 收集 SQL 块
 *
 * 遍历 AST 中的所有 code 节点，提取带 data.sql 信息的节点并转换为 SqlBlock 格式。
 * 该函数也可导出给高级用户直接使用（如已有 AST 的场景）。
 *
 * @param ast - remark AST 根节点
 * @returns SQL 代码块数组
 *
 * @example
 * const ast = processor.runSync(processor.parse(markdown));
 * const blocks = collectSqlBlocks(ast);
 */
export function collectSqlBlocks(ast: Root): SqlBlock[] {
	const blocks: SqlBlock[] = [];

	visit(ast, 'code', (node: SqlCodeNode) => {
		const sqlData = node.data?.sql;
		if (!sqlData) {
			return;
		}

		blocks.push({
			blockId: sqlData.blockId,
			content: node.value,
			isExecutable: sqlData.isExecutable,
			role: sqlData.role,
			startLine: sqlData.startLine,
			endLine: sqlData.endLine,
			lang: node.lang || 'sql',
		});
	});

	return blocks;
}
