import type { Data } from 'unist';
import type { Code } from 'mdast';

/**
 * 扩展 unist Data 接口以支持 SQL 元信息
 */
export interface SqlData extends Data {
	sql?: {
		isExecutable: boolean;
		role?: string;
		blockId: string;
		startLine?: number;
		endLine?: number;
	};
}

/**
 * SQL 代码节点类型（Code 节点 + SQL data 扩展）
 */
export type SqlCodeNode = Code & { data?: SqlData };

/**
 * 导出给业务层使用的 SQL 块数据结构
 */
export interface SqlBlock {
	/** 唯一标识（基于行号和计数器生成） */
	blockId: string;
	/** SQL 代码内容 */
	content: string;
	/** 是否可执行（role=final 时默认为 true） */
	isExecutable: boolean;
	/** 角色标记：final（最终SQL）/ intermediate（中间分析）/ init（初始化脚本）等 */
	role?: 'final' | 'intermediate' | 'init' | string;
	/** 代码块起始行号 */
	startLine?: number;
	/** 代码块结束行号 */
	endLine?: number;
	/** SQL 方言，来自 code fence（如 'sql'/'pgsql'/'mysql'） */
	lang: string;
}
