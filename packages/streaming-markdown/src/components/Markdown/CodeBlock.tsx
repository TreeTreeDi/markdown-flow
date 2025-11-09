import type { ReactNode } from 'react';

export interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
}

export function CodeBlock({ code, language, className }: CodeBlockProps): ReactNode {
  return (
    <div className={className}>
      <pre>
        <code data-language={language}>{code}</code>
      </pre>
    </div>
  );
}
