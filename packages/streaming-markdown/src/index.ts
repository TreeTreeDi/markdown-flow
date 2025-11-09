export type {
  MessageRole,
  MessageMetadata,
  MessageBlockMetadata,
  TextMessageBlock,
  MediaMessageBlock,
  ToolMessageBlock,
  MessageBlock,
  Message,
  MessageMap,
  MessageBlockMap,
} from './types/message';

export { MessageStatus, MessageBlockStatus, MessageBlockType } from './types/message';

export { MessageBlockStore, messageBlockStore } from './store/messageBlocks';

export { StreamingMarkdown } from './components/Markdown/StreamingMarkdown';
export type {
  StreamingMarkdownProps,
  StreamingStatus,
} from './components/Markdown/StreamingMarkdown';

export { CodeBlock } from './components/Markdown/CodeBlock';
export type { CodeBlockProps } from './components/Markdown/CodeBlock';

export { MessageBlockRenderer } from './components/Message/MessageBlockRenderer';
export type { MessageBlockRendererProps } from './components/Message/MessageBlockRenderer';

export { MessageItem } from './components/Message/MessageItem';
export type { MessageItemProps } from './components/Message/MessageItem';

export { useSmoothStream } from './hooks/useSmoothStream';
export type { UseSmoothStreamOptions } from './hooks/useSmoothStream';

export { splitMarkdownIntoBlocks } from './utils/markdown/splitMarkdownIntoBlocks';
export type { SplitOptions } from './utils/markdown/splitMarkdownIntoBlocks';

export { groupMessagesByRole, filterMessagesByStatus } from './utils/messages';
