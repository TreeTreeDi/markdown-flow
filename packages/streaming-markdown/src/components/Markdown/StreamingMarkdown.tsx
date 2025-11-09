import type { ReactNode } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';
import { useSmoothStream } from '../../hooks/useSmoothStream';
import { CodeBlock } from './CodeBlock';

export type StreamingStatus = 'idle' | 'streaming' | 'success' | 'error';

export interface StreamingMarkdownProps {
  children?: ReactNode;
  className?: string;
  components?: Partial<Components>;
  status?: StreamingStatus;
  onComplete?: () => void;
  minDelay?: number;
  blockId?: string;
}

export function StreamingMarkdown({
  children,
  className,
  components: customComponents,
  status = 'idle',
  onComplete,
  minDelay = 10,
}: StreamingMarkdownProps): ReactNode {
  const markdown = typeof children === 'string' ? children : String(children || '');
  const [displayedText, setDisplayedText] = useState(status !== 'streaming' ? markdown : '');
  const previousChildrenRef = useRef<string>(status !== 'streaming' ? markdown : '');

  console.log('StreamingMarkdown children:', markdown);
  const { addChunk, reset } = useSmoothStream({
    onUpdate: setDisplayedText,
    streamDone: status !== 'streaming',
    minDelay,
    initialText: status !== 'streaming' ? markdown : '',
    onComplete,
  });

  useEffect(() => {
    const currentContent = markdown;
    const previousContent = previousChildrenRef.current;

    if (currentContent !== previousContent) {
      if (currentContent.startsWith(previousContent)) {
        const delta = currentContent.slice(previousContent.length);
        addChunk(delta);
      } else {
        reset(currentContent);
      }
      previousChildrenRef.current = currentContent;
    }
  }, [markdown, addChunk, reset]);


  const components = useMemo(() => {
    const baseComponents = {
      code: (props: any) => {
        const { node, inline, className, children, ...rest } = props;
        if (inline) {
          return <code className={className} {...rest}>{children}</code>;
        }
        const match = /language-(\w+)/.exec(className || '');
        const language = match ? match[1] : undefined;
        const code = String(children).replace(/\n$/, '');
        return <CodeBlock code={code} language={language} className={className} />;
      },
      pre: (props: any) => {
        const { children, ...rest } = props;
        if (children?.type === CodeBlock) {
          return children;
        }
        return <pre style={{ overflow: 'visible' }} {...rest}>{children}</pre>;
      },
      p: (props: any) => {
        const hasCodeBlock = props?.node?.children?.some(
          (child: any) => child.tagName === 'pre' || child.tagName === 'code'
        );
        if (hasCodeBlock) {
          return <>{props.children}</>;
        }
        const hasImage = props?.node?.children?.some((child: any) => child.tagName === 'img');
        if (hasImage) return <div {...props} />;
        return <p {...props} />;
      },
    } as Partial<Components>;

    if (/<style\b[^>]*>/i.test(markdown)) {
      (baseComponents as any).style = (props: any) => <div {...props} />;
    }

    return { ...baseComponents, ...customComponents };
  }, [markdown, customComponents]);

  return (
    <ReactMarkdown
      className={className}
      remarkPlugins={[remarkGfm]}
      components={components}
    >
      {displayedText}
    </ReactMarkdown>
  );
}

