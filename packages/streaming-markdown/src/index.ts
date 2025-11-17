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

export { useShikiHighlight } from './hooks/useShikiHighlight';

export { parseMarkdownIntoBlocks, splitMarkdownIntoBlocks } from './utils/markdown/parseMarkdownIntoBlocks';
export type { SplitOptions } from './utils/markdown/parseMarkdownIntoBlocks';

export { sameNodePosition, sameClassAndNode } from './utils/markdown/sameNodePosition';
export type { MarkdownNode, MarkdownPosition } from './utils/markdown/sameNodePosition';

export { highlighterManager, ShikiHighlighterManager } from './utils/shiki/ShikiHighlighterManager';

export {
  getLanguageImport,
  getThemeImport,
  isLanguageSupported,
  isThemeSupported,
  getSupportedLanguages,
  getSupportedThemes,
} from './utils/shiki/languageRegistry';

export { Block } from './components/Markdown/Block';
export type { BlockProps } from './components/Markdown/Block';

export {
  MemoH1,
  MemoH2,
  MemoH3,
  MemoH4,
  MemoH5,
  MemoH6,
  MemoParagraph,
  MemoLink,
  MemoBlockquote,
  MemoList,
  MemoListItem,
  MemoTable,
  MemoTableHead,
  MemoTableBody,
  MemoTableRow,
  MemoTableCell,
  MemoCode,
  MemoPreformatted,
  MemoStrong,
  MemoEmphasis,
  MemoHr,
  MemoImage,
  MemoDelete,
} from './components/Markdown/MemoizedComponents';

// SQL 相关导出
export { extractSqlBlocksFromMarkdown, collectSqlBlocks } from './utils/sql/extractSqlBlocks';
export { parseSqlMeta } from './utils/sql/parseSqlMeta';
export { remarkSqlMarker } from './plugins/remarkSqlMarker';
export type { SqlBlock, SqlData, SqlCodeNode } from './types/sqlBlock';
