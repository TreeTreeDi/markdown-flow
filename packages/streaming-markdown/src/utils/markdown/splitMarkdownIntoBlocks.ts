import type { MessageBlock, TextMessageBlock } from '../../types/message';
import { MessageBlockStatus, MessageBlockType } from '../../types/message';

let blockIdCounter = 0;

function generateBlockId(): string {
  blockIdCounter += 1;
  return `block-${Date.now()}-${blockIdCounter}`;
}

export interface SplitOptions {
  messageId: string;
  markdown: string;
  status?: MessageBlockStatus;
}

export function splitMarkdownIntoBlocks({
  messageId,
  markdown,
  status = MessageBlockStatus.IDLE,
}: SplitOptions): MessageBlock[] {
  if (!markdown.trim()) {
    return [];
  }

  const block: TextMessageBlock = {
    id: generateBlockId(),
    messageId,
    type: MessageBlockType.MAIN_TEXT,
    status,
    content: markdown,
    createdAt: new Date().toISOString(),
  };

  return [block];
}
