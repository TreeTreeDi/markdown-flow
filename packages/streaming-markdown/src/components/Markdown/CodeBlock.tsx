import type { ReactNode } from 'react';
import { useShikiHighlight } from '../../hooks/useShikiHighlight';

export interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
  theme?: 'light' | 'dark';
  showLineNumbers?: boolean;
}

export function CodeBlock({ 
  code, 
  language = 'text', 
  className,
  theme = 'light',
}: CodeBlockProps): ReactNode {
  const { html, isLoading } = useShikiHighlight({ code, language, theme });

  if (isLoading) {
    return (
      <pre className={className}>
        <code data-language={language}>{code}</code>
      </pre>
    );
  }

  return (
    <div 
      dangerouslySetInnerHTML={{ __html: html }} 
      className={className}
      style={{ 
        borderRadius: '8px',
        overflow: 'auto'
      }}
    />
  );
}
