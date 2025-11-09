import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { nanoid } from 'nanoid';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { messageBlockStore } from '../../store/messageBlocks';
import type { MessageRole } from '../../types/message';
import { MessageBlockStatus } from '../../types/message';
import { splitMarkdownIntoBlocks } from '../../utils/markdown/splitMarkdownIntoBlocks';
import { MessageBlockRenderer } from './MessageBlockRenderer';

export interface MessageItemProps {
  children?: ReactNode;
  role?: MessageRole;
  messageId?: string;
  className?: string;
  blockClassName?: string;
}

export function MessageItem({
  children,
  role = 'assistant',
  messageId,
  className,
  blockClassName,
}: MessageItemProps): ReactNode {
  const markdown = typeof children === 'string' ? children : String(children ?? '');

  if (role === 'user') {
    return (
      <div className={className} data-role="user">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
      </div>
    );
  }

  const messageIdRef = useMemo(() => messageId ?? nanoid(), [messageId]);

  const blocks = useMemo(() => {
    const allBlocks = messageBlockStore.selectAll();
    const oldBlockIds = allBlocks
      .filter((b) => b.messageId === messageIdRef)
      .map((b) => b.id);

    if (oldBlockIds.length > 0) {
      messageBlockStore.remove(oldBlockIds);
    }

    const newBlocks = splitMarkdownIntoBlocks({
      messageId: messageIdRef,
      markdown,
      status: MessageBlockStatus.IDLE,
    });

    messageBlockStore.upsert(newBlocks);
    return newBlocks;
  }, [markdown, messageIdRef]);

  return (
    <div className={className} data-message-id={messageIdRef} data-role={role}>
      {blocks.map((block) => (
        <MessageBlockRenderer key={block.id} block={block} className={blockClassName} />
      ))}
    </div>
  );
}
