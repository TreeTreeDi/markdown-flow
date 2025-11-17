/**
 * 解析 code block 的 metastring，提取 SQL 相关元信息
 *
 * @param lang - 代码块语言标识（如 'sql', 'pgsql', 'mysql'）
 * @param meta - code fence 的 metastring（如 '{ role=final executable=true }'）
 * @returns 解析结果，包含 isSql、role 和 isExecutable
 *
 * @example
 * parseSqlMeta('sql', '{ role=final }')
 * // => { isSql: true, role: 'final', isExecutable: true }
 *
 * @example
 * parseSqlMeta('sql', '{ role=intermediate executable=false }')
 * // => { isSql: true, role: 'intermediate', isExecutable: false }
 *
 * @example
 * parseSqlMeta('javascript', '')
 * // => { isSql: false, isExecutable: false }
 */
export function parseSqlMeta(
	lang?: string,
	meta?: string,
): {
	isSql: boolean;
	role?: string;
	isExecutable: boolean;
} {
	// 支持的 SQL 方言
	const sqlDialects = ['sql', 'pgsql', 'mysql', 'sqlite', 'tsql', 'plsql'];
	const isSql = sqlDialects.some((dialect) =>
		lang?.toLowerCase().startsWith(dialect),
	);

	if (!isSql) {
		return { isSql: false, isExecutable: false };
	}

	// 解析 metastring: { role=final executable=true }
	const kvPairs: Record<string, string> = {};

	if (meta) {
		// 匹配花括号内的内容
		const metaMatch = meta.match(/\{([^}]+)\}/);
		if (metaMatch) {
			const pairsStr = metaMatch[1].trim();
			// 分割成 key=value 对
			const pairs = pairsStr.split(/\s+/);
			for (const pair of pairs) {
				const [key, value] = pair.split('=');
				if (key && value) {
					kvPairs[key.trim()] = value.trim();
				}
			}
		}
	}

	const role = kvPairs.role;

	// 语义默认规则：role=final 时自动可执行
	let isExecutable = kvPairs.executable === 'true';
	if (role === 'final' && !kvPairs.executable) {
		isExecutable = true;
	}

	return { isSql, role, isExecutable };
}
