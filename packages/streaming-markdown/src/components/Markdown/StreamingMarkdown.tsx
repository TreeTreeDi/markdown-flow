import type { ReactNode } from 'react';
import { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';

export interface StreamingMarkdownProps {
  children?: ReactNode;
  className?: string;
  components?: Partial<Components>;
  onComplete?: () => void;
}

export function StreamingMarkdown({
  children,
  className,
  components,
}: StreamingMarkdownProps): ReactNode {
  const processedContent = useMemo(() => {
    const content = typeof children === 'string' ? children : String(children || '');

    console.log('Original content:123123', JSON.stringify(content));

    const trimmed = content.trim();
    
    if (trimmed.endsWith('```') && !trimmed.endsWith('```\n')) {
      return `${trimmed}\n`;
    }
    
    return trimmed;
  }, [children]);

  return (
    <ReactMarkdown
      className={className}
      remarkPlugins={[remarkGfm]}
      components={components}
    >
      {processedContent}
    </ReactMarkdown>
  );
}

