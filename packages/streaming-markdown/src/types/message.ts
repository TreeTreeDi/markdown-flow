export type MessageRole = 'system' | 'user' | 'assistant' | 'tool' | (string & {});

export enum MessageStatus {
  IDLE = 'idle',
  STREAMING = 'streaming',
  SUCCESS = 'success',
  ERROR = 'error'
}

export enum MessageBlockStatus {
  IDLE = 'idle',
  STREAMING = 'streaming',
  SUCCESS = 'success',
  ERROR = 'error'
}

export enum MessageBlockType {
  MAIN_TEXT = 'main_text',
  CODE = 'code',
  IMAGE = 'image',
  FILE = 'file',
  TOOL = 'tool',
  CITATION = 'citation',
  TRANSLATION = 'translation',
  THINKING = 'thinking',
  VIDEO = 'video',
  ERROR = 'error',
  UNKNOWN = 'unknown'
}

export interface MessageMetadata {
  [key: string]: unknown;
}

export interface MessageBlockMetadata {
  [key: string]: unknown;
}

interface MessageBlockBase {
  id: string;
  messageId: string;
  type: MessageBlockType;
  status: MessageBlockStatus;
  createdAt: string;
  updatedAt?: string;
  metadata?: MessageBlockMetadata;
}

export interface TextMessageBlock extends MessageBlockBase {
  content: string;
  type:
    | MessageBlockType.MAIN_TEXT
    | MessageBlockType.CODE
    | MessageBlockType.TRANSLATION
    | MessageBlockType.THINKING
    | MessageBlockType.ERROR
    | MessageBlockType.UNKNOWN;
}

export interface MediaMessageBlock extends MessageBlockBase {
  type: MessageBlockType.IMAGE | MessageBlockType.VIDEO | MessageBlockType.FILE;
  url: string;
  previewUrl?: string;
  name?: string;
  mimeType?: string;
  size?: number;
  content?: string;
}

export interface ToolMessageBlock extends MessageBlockBase {
  type: MessageBlockType.TOOL | MessageBlockType.CITATION;
  content?: string;
  payload?: Record<string, unknown>;
}

export type MessageBlock = TextMessageBlock | MediaMessageBlock | ToolMessageBlock;

export interface Message {
  id: string;
  role: MessageRole;
  blockIds: string[];
  status: MessageStatus;
  createdAt: string;
  updatedAt?: string;
  askId?: string;
  metadata?: MessageMetadata;
}

export type MessageMap = Record<string, Message>;
export type MessageBlockMap = Record<string, MessageBlock>;
