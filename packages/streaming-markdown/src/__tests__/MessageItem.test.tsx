import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { MessageItem } from '../components/Message/MessageItem';
import { messageBlockStore } from '../store/messageBlocks';

describe('MessageItem', () => {
  beforeEach(() => {
    messageBlockStore.clear();
  });

  describe('user role', () => {
    it('应该直接渲染 ReactMarkdown', () => {
      const { container } = render(
        <MessageItem role="user"># Hello user</MessageItem>
      );

      const wrapper = container.querySelector('[data-role="user"]');
      expect(wrapper).toBeTruthy();
      expect(wrapper?.querySelector('h1')).toBeTruthy();
    });

    it('应该不使用 store', () => {
      render(<MessageItem role="user">User message</MessageItem>);

      const allBlocks = messageBlockStore.selectAll();
      expect(allBlocks.length).toBe(0);
    });

    it('应该正确渲染 markdown 内容', () => {
      render(
        <MessageItem role="user">**Bold** and *italic*</MessageItem>
      );

      expect(screen.getByText('Bold', { exact: false })).toBeTruthy();
      expect(screen.getByText('italic', { exact: false })).toBeTruthy();
    });
  });

  describe('assistant role', () => {
    it('应该默认使用 assistant role', () => {
      const { container } = render(<MessageItem># Hello assistant</MessageItem>);

      const wrapper = container.querySelector('[data-role="assistant"]');
      expect(wrapper).toBeTruthy();
    });

    it('应该写入 store 并渲染 blocks', () => {
      render(<MessageItem>Assistant message</MessageItem>);

      const allBlocks = messageBlockStore.selectAll();
      expect(allBlocks.length).toBeGreaterThan(0);
    });

    it('应该生成 message id', () => {
      const { container } = render(<MessageItem>Test</MessageItem>);

      const wrapper = container.querySelector('[data-message-id]');
      expect(wrapper?.getAttribute('data-message-id')).toBeTruthy();
    });

    it('应该支持自定义 messageId', () => {
      const customId = 'custom-msg-123';
      const { container } = render(
        <MessageItem messageId={customId}>Test</MessageItem>
      );

      const wrapper = container.querySelector(`[data-message-id="${customId}"]`);
      expect(wrapper).toBeTruthy();
    });

    it('应该自动分块处理 markdown', () => {
      render(
        <MessageItem>{`# Title\n\`\`\`js\nconst x = 1;\n\`\`\``}</MessageItem>
      );

      const allBlocks = messageBlockStore.selectAll();
      expect(allBlocks.length).toBeGreaterThan(0);
    });
  });

  describe('children 更新', () => {
    it('应该响应 children 变化 (assistant)', () => {
      messageBlockStore.clear();
      const customId = 'test-msg-update';
      const { rerender } = render(
        <MessageItem messageId={customId}>Initial</MessageItem>
      );

      const initialBlocks = messageBlockStore.selectAll();
      expect(initialBlocks.length).toBe(1);
      expect(initialBlocks[0].content).toContain('Initial');

      rerender(<MessageItem messageId={customId}>Updated content</MessageItem>);

      const updatedBlocks = messageBlockStore.selectAll();
      expect(updatedBlocks.length).toBeGreaterThan(0);
      const latestBlock = updatedBlocks.find((b) => b.messageId === customId);
      expect(latestBlock?.content).toContain('Updated content');
    });

    it('应该响应 children 变化 (user)', () => {
      const { rerender, container } = render(
        <MessageItem role="user">Initial</MessageItem>
      );

      expect(container.textContent).toContain('Initial');

      rerender(<MessageItem role="user">Updated</MessageItem>);

      expect(container.textContent).toContain('Updated');
    });
  });

  describe('className props', () => {
    it('应该应用 className', () => {
      const { container } = render(
        <MessageItem className="custom-class">Test</MessageItem>
      );

      expect(container.querySelector('.custom-class')).toBeTruthy();
    });

    it('应该应用 blockClassName 到 blocks', () => {
      const { container } = render(
        <MessageItem blockClassName="block-custom">Test</MessageItem>
      );

      expect(container.querySelector('.block-custom')).toBeTruthy();
    });
  });
});
