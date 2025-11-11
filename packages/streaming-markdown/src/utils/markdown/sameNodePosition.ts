/**
 * Markdown AST 节点位置信息
 */
export interface MarkdownPosition {
  start?: {
    line?: number;
    column?: number;
    offset?: number;
  };
  end?: {
    line?: number;
    column?: number;
    offset?: number;
  };
}

/**
 * Markdown AST 节点（简化接口）
 */
export interface MarkdownNode {
  position?: MarkdownPosition;
  [key: string]: unknown;
}

/**
 * 比较两个 Markdown AST 节点的位置是否相同
 * 
 * 用于 React.memo 的比较函数中，快速判断节点是否变化
 * 时间复杂度: O(1)
 * 
 * @param prev - 前一个节点
 * @param next - 当前节点
 * @returns true 表示位置相同（无需重渲染），false 表示位置不同（需重渲染）
 */
export function sameNodePosition(
  prev?: MarkdownNode,
  next?: MarkdownNode
): boolean {
  // 边界情况 1: 两个节点都没有 position 信息，视为相同
  if (!(prev?.position || next?.position)) {
    return true;
  }

  // 边界情况 2: 只有一个节点有 position，视为不同
  if (!(prev?.position && next?.position)) {
    return false;
  }

  const prevStart = prev.position.start;
  const nextStart = next.position.start;
  const prevEnd = prev.position.end;
  const nextEnd = next.position.end;

  // 比较 start 和 end 的 line + column
  return (
    prevStart?.line === nextStart?.line &&
    prevStart?.column === nextStart?.column &&
    prevEnd?.line === nextEnd?.line &&
    prevEnd?.column === nextEnd?.column
  );
}

/**
 * 同时比较节点位置和 className
 * 
 * 用于大多数 Markdown 组件的 memo 比较
 */
export function sameClassAndNode(
  prev: { className?: string; node?: MarkdownNode },
  next: { className?: string; node?: MarkdownNode }
): boolean {
  return (
    prev.className === next.className &&
    sameNodePosition(prev.node, next.node)
  );
}
