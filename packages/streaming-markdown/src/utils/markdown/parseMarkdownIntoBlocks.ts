import { Lexer } from 'marked';
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

/**
 * 将 Markdown 字符串智能切分为多个 block，同时保护语法完整性
 * 
 * 特殊处理：
 * - 脚注：检测到 [^id] 或 [^id]: 时不分块
 * - HTML 标签：使用栈匹配，合并开闭标签之间的内容
 * - 数学公式：配对 $ 符号，奇数时合并
 * 
 * @param options - 包含 messageId, markdown, status 的配置对象
 * @returns MessageBlock[] - 分块后的 block 数组
 */
export function parseMarkdownIntoBlocks(markdown: string): string[] {
  if (!markdown.trim()) {
    return [];
  }

  // 步骤 1: 脚注检测 - 如果存在脚注则不分块
  const hasFootnoteReference = /\[\^[^\]\s]{1,200}\](?!:)/.test(markdown);
  const hasFootnoteDefinition = /\[\^[^\]\s]{1,200}\]:/.test(markdown);

  if (hasFootnoteReference || hasFootnoteDefinition) {
    return [markdown];
  }

  // 步骤 2: 使用 Lexer 进行 token 分析
  const tokens = Lexer.lex(markdown, { gfm: true });

  const mergedBlocks: string[] = [];
  const htmlStack: string[] = []; // HTML 标签栈

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const currentBlock = token.raw;

    // 步骤 3: HTML 块处理 - 栈非空时合并到前一个块
    if (htmlStack.length > 0) {
      mergedBlocks[mergedBlocks.length - 1] += currentBlock;

      // 检查是否有闭标签
      if (token.type === 'html') {
        const closingTagMatch = currentBlock.match(/<\/(\w+)>/);
        if (closingTagMatch) {
          const closingTag = closingTagMatch[1];
          // 出栈匹配
          if (htmlStack[htmlStack.length - 1] === closingTag) {
            htmlStack.pop();
          }
        }
      }
      continue;
    }

    // 检查是否是开标签（无对应闭标签）
    if (token.type === 'html' && token.block) {
      const openingTagMatch = currentBlock.match(/<(\w+)[\s>]/);
      if (openingTagMatch) {
        const tagName = openingTagMatch[1];
        const hasClosingTag = currentBlock.includes(`</${tagName}>`);
        if (!hasClosingTag) {
          htmlStack.push(tagName); // 入栈
        }
      }
    }

    // 步骤 4: 数学块处理 - 配对 $ 符号
    if (currentBlock.trim() === '$' && mergedBlocks.length > 0) {
      const previousBlock = mergedBlocks.at(-1);
      if (!previousBlock) {
        mergedBlocks.push(currentBlock);
        continue;
      }

      const prevStartsWith$ = previousBlock.trimStart().startsWith('$');
      const prevDollarCount = (previousBlock.match(/\$\$/g) || []).length;

      // 奇数 $ 需要合并
      if (prevStartsWith$ && prevDollarCount % 2 === 1) {
        mergedBlocks[mergedBlocks.length - 1] = previousBlock + currentBlock;
        continue;
      }
    }

    // 检查当前块是否结束数学块
    if (mergedBlocks.length > 0 && currentBlock.trimEnd().endsWith('$')) {
      const previousBlock = mergedBlocks.at(-1);
      if (!previousBlock) {
        mergedBlocks.push(currentBlock);
        continue;
      }

      const prevStartsWith$ = previousBlock.trimStart().startsWith('$');
      const prevDollarCount = (previousBlock.match(/\$\$/g) || []).length;
      const currDollarCount = (currentBlock.match(/\$\$/g) || []).length;

      if (
        prevStartsWith$ &&
        prevDollarCount % 2 === 1 &&
        !currentBlock.trimStart().startsWith('$') &&
        currDollarCount === 1
      ) {
        mergedBlocks[mergedBlocks.length - 1] = previousBlock + currentBlock;
        continue;
      }
    }

    // 默认：追加新块
    mergedBlocks.push(currentBlock);
  }

  return mergedBlocks;
}

/**
 * 将 Markdown 字符串切分为 MessageBlock 数组
 * 
 * @param options - 包含 messageId, markdown, status 的配置对象
 * @returns MessageBlock[] - 分块后的 MessageBlock 数组
 */
export function splitMarkdownIntoBlocks({
  messageId,
  markdown,
  status = MessageBlockStatus.IDLE,
}: SplitOptions): MessageBlock[] {
  const blocks = parseMarkdownIntoBlocks(markdown);

  return blocks.map((content) => {
    const block: TextMessageBlock = {
      id: generateBlockId(),
      messageId,
      type: MessageBlockType.MAIN_TEXT,
      status,
      content,
      createdAt: new Date().toISOString(),
    };
    return block;
  });
}
