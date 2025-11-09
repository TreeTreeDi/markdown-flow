import type { ReactNode } from 'react';
import type { MessageBlock } from '../../types/message';
import { MessageBlockType, MessageBlockStatus } from '../../types/message';
import { StreamingMarkdown } from '../Markdown/StreamingMarkdown';

export interface MessageBlockRendererProps {
  block: MessageBlock;
  className?: string;
}

export function MessageBlockRenderer({ block, className }: MessageBlockRendererProps): ReactNode {
  switch (block.type) {
    case MessageBlockType.MAIN_TEXT:
    case MessageBlockType.TRANSLATION:
    case MessageBlockType.THINKING:
    case MessageBlockType.ERROR:
    case MessageBlockType.UNKNOWN: {
      const textBlock = block as Extract<MessageBlock, { content: string }>;
      return (
        <StreamingMarkdown
          className={className}
          status={block.status === MessageBlockStatus.STREAMING ? 'streaming' : 'success'}
        >
          {textBlock.content}
        </StreamingMarkdown>
      );
    }

    case MessageBlockType.CODE: {
      const codeBlock = block as Extract<MessageBlock, { content: string }>;
      return (
        <div className={className}>
          <pre>
            <code>{codeBlock.content}</code>
          </pre>
        </div>
      );
    }

    case MessageBlockType.IMAGE:
    case MessageBlockType.VIDEO:
    case MessageBlockType.FILE: {
      const mediaBlock = block as Extract<MessageBlock, { url: string }>;
      return (
        <div className={className}>
          <a href={mediaBlock.url} target="_blank" rel="noopener noreferrer">
            {mediaBlock.name ?? 'Media File'}
          </a>
        </div>
      );
    }

    case MessageBlockType.TOOL:
    case MessageBlockType.CITATION: {
      const toolBlock = block as Extract<MessageBlock, { payload?: Record<string, unknown> }>;
      return (
        <div className={className}>
          <pre>{JSON.stringify(toolBlock.payload ?? {}, null, 2)}</pre>
        </div>
      );
    }

    default:
      return null;
  }
}
