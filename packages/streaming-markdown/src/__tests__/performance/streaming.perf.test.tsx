import { render } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { MessageItem } from '../../components/Message/MessageItem';
import { messageBlockStore } from '../../store/messageBlocks';

describe('流式渲染性能测试', () => {
  beforeEach(() => {
    messageBlockStore.clear();
  });

  it('追加 1 块应在 50ms 内完成', () => {
    const block1 = '# Block 1\n\nFirst block content';
    const block2 = '\n\n## Block 2\n\nSecond block content';
    
    const { rerender } = render(
      <MessageItem messageId="perf-test-1">{block1}</MessageItem>
    );

    const start = performance.now();
    rerender(
      <MessageItem messageId="perf-test-1">{block1 + block2}</MessageItem>
    );
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(50);
  });

  it('追加 5 块应保持高性能', () => {
    let content = '# Block 1\n\nFirst block';
    const { rerender } = render(
      <MessageItem messageId="perf-test-2">{content}</MessageItem>
    );

    const durations: number[] = [];

    for (let i = 2; i <= 6; i++) {
      content += `\n\n## Block ${i}\n\nBlock ${i} content`;
      
      const start = performance.now();
      rerender(
        <MessageItem messageId="perf-test-2">{content}</MessageItem>
      );
      const duration = performance.now() - start;
      
      durations.push(duration);
    }

    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    const maxDuration = Math.max(...durations);

    expect(avgDuration).toBeLessThan(50);
    expect(maxDuration).toBeLessThan(100);
  });

  it('追加代码块应在 50ms 内完成', () => {
    const block1 = '# Code Example';
    const codeBlock = '\n\n```typescript\nfunction hello() {\n  console.log("world");\n}\n```';
    
    const { rerender } = render(
      <MessageItem messageId="perf-test-3">{block1}</MessageItem>
    );

    const start = performance.now();
    rerender(
      <MessageItem messageId="perf-test-3">{block1 + codeBlock}</MessageItem>
    );
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(50);
  });

  it('流式追加 10 块的总耗时应合理', () => {
    let content = '# Title\n\nIntro';
    const { rerender } = render(
      <MessageItem messageId="perf-test-4">{content}</MessageItem>
    );

    const totalStart = performance.now();

    for (let i = 1; i <= 10; i++) {
      content += `\n\n## Section ${i}\n\nContent for section ${i}`;
      rerender(
        <MessageItem messageId="perf-test-4">{content}</MessageItem>
      );
    }

    const totalDuration = performance.now() - totalStart;

    expect(totalDuration).toBeLessThan(500);
  });
});
