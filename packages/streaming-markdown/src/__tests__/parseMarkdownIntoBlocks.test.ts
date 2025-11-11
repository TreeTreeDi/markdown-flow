import { describe, it, expect } from 'vitest';
import { parseMarkdownIntoBlocks, splitMarkdownIntoBlocks } from '../utils/markdown/parseMarkdownIntoBlocks';
import { MessageBlockStatus } from '../types/message';

describe('parseMarkdownIntoBlocks', () => {
  describe('Simple paragraph splitting', () => {
    it('应该将多个段落分为多个 block', () => {
      const markdown = '# Title\n\nParagraph 1\n\nParagraph 2';
      const blocks = parseMarkdownIntoBlocks(markdown);
      
      expect(blocks.length).toBeGreaterThan(1);
      expect(blocks.join('')).toBe(markdown);
    });

    it('应该处理空字符串', () => {
      const blocks = parseMarkdownIntoBlocks('');
      expect(blocks).toEqual([]);
    });

    it('应该处理单一段落', () => {
      const markdown = 'Single paragraph';
      const blocks = parseMarkdownIntoBlocks(markdown);
      
      expect(blocks.length).toBeGreaterThanOrEqual(1);
      expect(blocks.join('')).toBe(markdown);
    });
  });

  describe('Footnote detection prevents splitting', () => {
    it('应该检测脚注引用并返回单一 block', () => {
      const markdown = 'Text with footnote[^1]\n\n[^1]: Footnote content';
      const blocks = parseMarkdownIntoBlocks(markdown);
      
      expect(blocks).toEqual([markdown]);
    });

    it('应该检测脚注定义', () => {
      const markdown = 'Some text\n\n[^note]: This is a note';
      const blocks = parseMarkdownIntoBlocks(markdown);
      
      expect(blocks).toEqual([markdown]);
    });

    it('应该检测多个脚注', () => {
      const markdown = 'Text[^1] more[^2]\n\n[^1]: One\n[^2]: Two';
      const blocks = parseMarkdownIntoBlocks(markdown);
      
      expect(blocks).toEqual([markdown]);
    });
  });

  describe('HTML tag stack matching', () => {
    it('应该合并未闭合的 HTML 标签', () => {
      const markdown = '<div>\n\nContent inside\n\n</div>\n\nAfter div';
      const blocks = parseMarkdownIntoBlocks(markdown);
      
      const combinedFirst = blocks.slice(0, -1).join('');
      expect(combinedFirst).toContain('<div>');
      expect(combinedFirst).toContain('</div>');
    });

    it('应该处理嵌套 HTML 标签', () => {
      const markdown = '<div class="outer">\n\n<p>Text</p>\n\n</div>';
      const blocks = parseMarkdownIntoBlocks(markdown);
      
      const combined = blocks.join('');
      expect(combined).toBe(markdown);
    });

    it('应该处理自闭合标签', () => {
      const markdown = '<div>\n\nContent\n\n</div>';
      const blocks = parseMarkdownIntoBlocks(markdown);
      
      expect(blocks.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Math formula pairing', () => {
    it('应该配对行内数学公式', () => {
      const markdown = 'Inline $x^2$ math';
      const blocks = parseMarkdownIntoBlocks(markdown);
      
      expect(blocks.join('')).toBe(markdown);
    });

    it('应该配对块级数学公式', () => {
      const markdown = '$\n\\begin{matrix}\na & b\n\\end{matrix}\n$\n\nAfter';
      const blocks = parseMarkdownIntoBlocks(markdown);
      
      const firstBlock = blocks[0];
      expect(firstBlock).toContain('$');
      expect(firstBlock).toContain('\\begin{matrix}');
    });

    it('应该处理奇数个 $ 符号', () => {
      const markdown = '$\nx^2 + y^2\n$';
      const blocks = parseMarkdownIntoBlocks(markdown);
      
      expect(blocks.join('')).toBe(markdown);
    });
  });

  describe('splitMarkdownIntoBlocks', () => {
    it('应该返回 MessageBlock 数组', () => {
      const result = splitMarkdownIntoBlocks({
        messageId: 'msg-1',
        markdown: '# Title\n\nContent',
        status: MessageBlockStatus.IDLE,
      });

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      
      const firstBlock = result[0];
      expect(firstBlock).toHaveProperty('id');
      expect(firstBlock).toHaveProperty('messageId', 'msg-1');
      expect(firstBlock).toHaveProperty('type');
      expect(firstBlock).toHaveProperty('status', MessageBlockStatus.IDLE);
      expect(firstBlock).toHaveProperty('content');
      expect(firstBlock).toHaveProperty('createdAt');
    });

    it('应该为每个 block 生成唯一 ID', () => {
      const result = splitMarkdownIntoBlocks({
        messageId: 'msg-1',
        markdown: '# A\n\n# B\n\n# C',
      });

      const ids = result.map(b => b.id);
      const uniqueIds = new Set(ids);
      
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('应该处理空 Markdown', () => {
      const result = splitMarkdownIntoBlocks({
        messageId: 'msg-1',
        markdown: '',
      });

      expect(result).toEqual([]);
    });
  });
});
