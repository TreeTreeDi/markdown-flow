import type { ReactNode } from 'react';
import { messageBlockStore } from '../../store/messageBlocks';
import type { Message } from '../../types/message';
import { MessageBlockRenderer } from './MessageBlockRenderer';

export interface MessageItemProps {
  message: Message;
  className?: string;
  blockClassName?: string;
}

export function MessageItem({
  message,
  className,
  blockClassName,
}: MessageItemProps): ReactNode {
  const blocks = messageBlockStore.selectMany(message.blockIds);

  return (
    <div className={className} data-message-id={message.id} data-role={message.role}>
      {blocks.map((block) => (
        <MessageBlockRenderer key={block.id} block={block} className={blockClassName} />
      ))}
    </div>
  );
}
