import type { ReactNode } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';
import { useSmoothStream } from '../../hooks/useSmoothStream';

export type StreamingStatus = 'idle' | 'streaming' | 'success' | 'error';

export interface StreamingMarkdownProps {
  children?: ReactNode;
  className?: string;
  components?: Partial<Components>;
  status?: StreamingStatus;
  onComplete?: () => void;
  minDelay?: number;
}

export function StreamingMarkdown({
  children,
  className,
  components,
  status = 'idle',
  onComplete,
  minDelay = 10,
}: StreamingMarkdownProps): ReactNode {
  const [displayedText, setDisplayedText] = useState('');
  const previousChildrenRef = useRef<string>('');

  const { addChunk, reset } = useSmoothStream({
    onUpdate: setDisplayedText,
    streamDone: status !== 'streaming',
    minDelay,
    initialText: '',
    onComplete,
  });

  useEffect(() => {
    const currentContent = typeof children === 'string' ? children : String(children || '');
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
  }, [children, addChunk, reset]);

  const processedContent = useMemo(() => {
    const trimmed = displayedText.trim();

    console.log('Displayed content:456456', JSON.stringify(displayedText));
    if (trimmed.endsWith('```') && !trimmed.endsWith('```\n')) {
      return `${trimmed}\n`;
    }

    return trimmed;
  }, [displayedText]);

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

