import { render } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { MessageItem } from '../../components/Message/MessageItem';
import { messageBlockStore } from '../../store/messageBlocks';

describe('块更新性能测试', () => {
  beforeEach(() => {
    messageBlockStore.clear();
  });

  it('修改第 1 块应在 50ms 内完成', () => {
    const initialContent = '# Block 1\n\nInitial content\n\n## Block 2\n\nStatic block';
    const updatedContent = '# Block 1 Updated\n\nModified content\n\n## Block 2\n\nStatic block';
    
    const { rerender } = render(
      <MessageItem messageId="update-test-1">{initialContent}</MessageItem>
    );

    const start = performance.now();
    rerender(
      <MessageItem messageId="update-test-1">{updatedContent}</MessageItem>
    );
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(50);
  });

  it('修改中间块应在 50ms 内完成', () => {
    const initialContent = '# Block 1\n\nFirst\n\n## Block 2\n\nMiddle\n\n### Block 3\n\nLast';
    const updatedContent = '# Block 1\n\nFirst\n\n## Block 2 Updated\n\nModified middle\n\n### Block 3\n\nLast';
    
    const { rerender } = render(
      <MessageItem messageId="update-test-2">{initialContent}</MessageItem>
    );

    const start = performance.now();
    rerender(
      <MessageItem messageId="update-test-2">{updatedContent}</MessageItem>
    );
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(50);
  });

  it('修改代码块内容应在 50ms 内完成', () => {
    const initialContent = '```typescript\nconst x = 1;\n```';
    const updatedContent = '```typescript\nconst x = 1;\nconst y = 2;\n```';
    
    const { rerender } = render(
      <MessageItem messageId="update-test-3">{initialContent}</MessageItem>
    );

    const start = performance.now();
    rerender(
      <MessageItem messageId="update-test-3">{updatedContent}</MessageItem>
    );
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(50);
  });

  it('无变化重渲染应在 15ms 内完成', () => {
    const content = '# Block 1\n\nStatic\n\n## Block 2\n\nContent';
    
    const { rerender } = render(
      <MessageItem messageId="update-test-4">{content}</MessageItem>
    );

    const start = performance.now();
    rerender(
      <MessageItem messageId="update-test-4">{content}</MessageItem>
    );
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(15);
  });

  it('频繁无变化重渲染应保持高性能', () => {
    const content = '# Block 1\n\nContent\n\n## Block 2\n\nMore content';
    
    const { rerender } = render(
      <MessageItem messageId="update-test-5">{content}</MessageItem>
    );

    const durations: number[] = [];

    for (let i = 0; i < 10; i++) {
      const start = performance.now();
      rerender(
        <MessageItem messageId="update-test-5">{content}</MessageItem>
      );
      const duration = performance.now() - start;
      durations.push(duration);
    }

    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    const maxDuration = Math.max(...durations);

    expect(avgDuration).toBeLessThan(15);
    expect(maxDuration).toBeLessThan(30);
  });
});
