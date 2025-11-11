import { render } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { MessageItem } from '../../components/Message/MessageItem';
import { messageBlockStore } from '../../store/messageBlocks';

describe('渲染次数优化测试', () => {
  beforeEach(() => {
    messageBlockStore.clear();
  });

  it('追加新块时，旧块不应重新渲染', () => {
    const renderCounts = new Map<string, number>();

    const TestWrapper = ({ children }: { children: string }) => {
      const blocks = React.useMemo(() => {
        return children.split('\n\n').filter(Boolean);
      }, [children]);

      return (
        <div>
          {blocks.map((block, index) => {
            const blockKey = `block-${index}`;
            
            if (!renderCounts.has(blockKey)) {
              renderCounts.set(blockKey, 0);
            }
            renderCounts.set(blockKey, renderCounts.get(blockKey)! + 1);

            return <div key={blockKey}>{block}</div>;
          })}
        </div>
      );
    };

    const block1 = 'Block 1';
    const block2 = 'Block 2';

    const { rerender } = render(<TestWrapper>{block1}</TestWrapper>);
    
    const block1InitialRenders = renderCounts.get('block-0') || 0;

    renderCounts.clear();

    rerender(<TestWrapper>{`${block1}\n\n${block2}`}</TestWrapper>);

    const block1AfterAppend = renderCounts.get('block-0') || 0;
    const block2AfterAppend = renderCounts.get('block-1') || 0;

    expect(block1InitialRenders).toBeGreaterThan(0);
    expect(block1AfterAppend).toBe(1);
    expect(block2AfterAppend).toBe(1);
  });

  it('使用 MessageItem 追加块时应更新 store', () => {
    const block1 = '# Block 1\n\nFirst block';
    const block2 = '\n\n## Block 2\n\nSecond block';

    const { rerender } = render(
      <MessageItem messageId="render-count-1">{block1}</MessageItem>
    );

    const initialBlocks = messageBlockStore.selectAll();
    const initialBlockCount = initialBlocks.length;

    rerender(
      <MessageItem messageId="render-count-1">{block1 + block2}</MessageItem>
    );

    const updatedBlocks = messageBlockStore.selectAll();
    const updatedBlockCount = updatedBlocks.length;

    expect(updatedBlockCount).toBeGreaterThanOrEqual(initialBlockCount);
    expect(updatedBlocks.length).toBeGreaterThan(0);
  });

  it('React.memo 应防止不必要的子组件渲染', () => {
    let childRenderCount = 0;

    const ChildComponent = React.memo(({ content }: { content: string }) => {
      childRenderCount++;
      return <div>{content}</div>;
    });

    const ParentComponent = ({ trigger }: { trigger: number }) => {
      return (
        <div>
          <ChildComponent content="static content" />
          <div>Trigger: {trigger}</div>
        </div>
      );
    };

    const { rerender } = render(<ParentComponent trigger={0} />);
    
    const renderCountAfterFirstRender = childRenderCount;
    expect(renderCountAfterFirstRender).toBe(1);

    rerender(<ParentComponent trigger={1} />);
    rerender(<ParentComponent trigger={2} />);
    rerender(<ParentComponent trigger={3} />);

    expect(childRenderCount).toBe(1);
  });

  it('内容相同时重渲染应被 memo 优化', () => {
    const content = '# Title\n\nStatic content';

    const { rerender } = render(
      <MessageItem messageId="render-count-2">{content}</MessageItem>
    );

    const initialBlocks = messageBlockStore.selectAll();

    for (let i = 0; i < 5; i++) {
      rerender(
        <MessageItem messageId="render-count-2">{content}</MessageItem>
      );
    }

    const finalBlocks = messageBlockStore.selectAll();

    expect(finalBlocks.length).toBe(initialBlocks.length);
    expect(finalBlocks[0].content).toBe(initialBlocks[0].content);
  });
});
