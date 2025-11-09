import type { ReactNode } from 'react';
import { useState } from 'react';
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
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  if (isLoading) {
    return (
      <pre className={className}>
        <code data-language={language}>{code}</code>
      </pre>
    );
  }

  return (
    <div className={`code-block-wrapper ${className || ''}`} style={{ position: 'relative' }}>
      <div style={{ 
        position: 'absolute', 
        top: '8px', 
        right: '8px', 
        display: 'flex', 
        gap: '8px',
        zIndex: 10
      }}>
        {language && (
          <span style={{
            fontSize: '12px',
            padding: '4px 8px',
            borderRadius: '4px',
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            color: theme === 'dark' ? '#e6e6e6' : '#333'
          }}>
            {language.toUpperCase()}
          </span>
        )}
        <button
          type="button"
          onClick={handleCopy}
          style={{
            padding: '4px 8px',
            fontSize: '12px',
            borderRadius: '4px',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: copied ? 'rgba(0, 200, 0, 0.2)' : 'rgba(0, 0, 0, 0.1)',
            color: theme === 'dark' ? '#e6e6e6' : '#333'
          }}
          title="复制代码"
        >
          {copied ? '✓' : '复制'}
        </button>
      </div>
      <div 
        dangerouslySetInnerHTML={{ __html: html }} 
        style={{ 
          borderRadius: '8px',
          overflow: 'auto'
        }}
      />
    </div>
  );
}
