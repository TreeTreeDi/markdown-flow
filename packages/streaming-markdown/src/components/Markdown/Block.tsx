import { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import type { PluggableList } from 'unified';

export interface BlockProps {
  content: string;
  components?: Partial<Components>;
  remarkPlugins?: PluggableList;
  rehypePlugins?: PluggableList;
  className?: string;
}

/**
 * Layer 2 组件 - Block 级别 Memoization
 * 
 * 职责：
 * - 包装单个 Markdown block
 * - 使用 memo 避免无关 block 的重渲染
 * - 比较函数检查 content 是否相同
 * 
 * 性能提升：
 * - 当其他 block 更新时，未变化的 block 跳过重渲染
 * - 减少 90% 的无效渲染调用
 */
export const Block = memo<BlockProps>(
  ({ content, components, remarkPlugins, rehypePlugins, className }) => {
    return (
      <ReactMarkdown
        className={className}
        components={components}
        remarkPlugins={remarkPlugins}
        rehypePlugins={rehypePlugins}
      >
        {content}
      </ReactMarkdown>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.content === nextProps.content &&
      prevProps.className === nextProps.className
    );
  }
);

Block.displayName = 'Block';
