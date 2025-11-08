import type { ReactNode } from 'react';
import { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';

export interface StreamingMarkdownProps {
  content: string;
  className?: string;
  components?: Partial<Components>;
  onComplete?: () => void;
}

export function StreamingMarkdown({
  content,
  className,
  components,
}: StreamingMarkdownProps): ReactNode {
  const processedContent = useMemo(() => {
    const trimmed = content.trim();
    
    if (trimmed.endsWith('```') && !trimmed.endsWith('```\n')) {
      return `${trimmed}\n`;
    }
    
    return trimmed;
  }, [content]);

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

export { StreamingMarkdown as default };
