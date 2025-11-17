import type { Plugin } from 'unified';
import type { Root } from 'mdast';
import { visit } from 'unist-util-visit';
import { parseSqlMeta } from '../utils/sql/parseSqlMeta';
import type { SqlCodeNode } from '../types/sqlBlock';

/**
 * Remark 插件：在 AST 解析阶段为 SQL 代码块注入 data.sql 元信息
 *
 * 该插件遍历 AST 中的所有 code 节点，识别 SQL 代码块并解析其 metastring，
 * 将元信息（role、isExecutable、blockId 等）注入到 node.data.sql 中。
 *
 * @recommended 推荐使用此插件方式，性能最优且符合 unified 生态标准
 *
 * @example
 * import { unified } from 'unified';
 * import remarkParse from 'remark-parse';
 * import { remarkSqlMarker } from './plugins/remarkSqlMarker';
 *
 * const processor = unified()
 *   .use(remarkParse)
 *   .use(remarkSqlMarker);
 *
 * const ast = processor.parse(markdown);
 * const transformed = processor.runSync(ast);
 * // code 节点现在包含 data.sql 信息
 */
export const remarkSqlMarker: Plugin<[], Root> = () => {
	return (tree) => {
		let blockCounter = 0;

		visit(tree, 'code', (node: SqlCodeNode) => {
			const { isSql, role, isExecutable } = parseSqlMeta(
				node.lang ?? undefined,
				node.meta ?? undefined,
			);

			if (!isSql) {
				return;
			}

			// 生成唯一 blockId（基于行号和计数器）
			const blockId = `sql-${node.position?.start.line ?? 0}-${++blockCounter}`;

			// 注入 data.sql 字段
			node.data = {
				...node.data,
				sql: {
					isExecutable,
					role,
					blockId,
					startLine: node.position?.start.line,
					endLine: node.position?.end.line,
				},
			};
		});
	};
};
