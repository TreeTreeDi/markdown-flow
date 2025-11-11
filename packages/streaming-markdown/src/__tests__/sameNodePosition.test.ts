import { describe, it, expect } from 'vitest';
import { sameNodePosition, sameClassAndNode, type MarkdownNode } from '../utils/markdown/sameNodePosition';

describe('sameNodePosition', () => {
  describe('Same position nodes', () => {
    it('应该识别相同位置的节点', () => {
      const prev: MarkdownNode = {
        position: {
          start: { line: 1, column: 1 },
          end: { line: 1, column: 10 },
        },
      };

      const next: MarkdownNode = {
        position: {
          start: { line: 1, column: 1 },
          end: { line: 1, column: 10 },
        },
      };

      expect(sameNodePosition(prev, next)).toBe(true);
    });

    it('应该处理包含 offset 的位置', () => {
      const prev: MarkdownNode = {
        position: {
          start: { line: 2, column: 5, offset: 15 },
          end: { line: 3, column: 10, offset: 45 },
        },
      };

      const next: MarkdownNode = {
        position: {
          start: { line: 2, column: 5, offset: 999 }, // offset 不同
          end: { line: 3, column: 10, offset: 888 },
        },
      };

      expect(sameNodePosition(prev, next)).toBe(true);
    });
  });

  describe('Different position nodes', () => {
    it('应该识别不同 line 的节点', () => {
      const prev: MarkdownNode = {
        position: {
          start: { line: 1, column: 1 },
          end: { line: 1, column: 10 },
        },
      };

      const next: MarkdownNode = {
        position: {
          start: { line: 2, column: 1 },
          end: { line: 2, column: 10 },
        },
      };

      expect(sameNodePosition(prev, next)).toBe(false);
    });

    it('应该识别不同 column 的节点', () => {
      const prev: MarkdownNode = {
        position: {
          start: { line: 1, column: 1 },
          end: { line: 1, column: 10 },
        },
      };

      const next: MarkdownNode = {
        position: {
          start: { line: 1, column: 1 },
          end: { line: 1, column: 15 },
        },
      };

      expect(sameNodePosition(prev, next)).toBe(false);
    });

    it('应该识别 start 不同的节点', () => {
      const prev: MarkdownNode = {
        position: {
          start: { line: 1, column: 1 },
          end: { line: 1, column: 10 },
        },
      };

      const next: MarkdownNode = {
        position: {
          start: { line: 1, column: 5 },
          end: { line: 1, column: 10 },
        },
      };

      expect(sameNodePosition(prev, next)).toBe(false);
    });
  });

  describe('Missing position data', () => {
    it('应该处理两个节点都没有 position', () => {
      const prev: MarkdownNode = {};
      const next: MarkdownNode = {};

      expect(sameNodePosition(prev, next)).toBe(true);
    });

    it('应该处理 undefined 节点', () => {
      expect(sameNodePosition(undefined, undefined)).toBe(true);
    });

    it('应该识别只有一个节点有 position (prev 有)', () => {
      const prev: MarkdownNode = {
        position: {
          start: { line: 1, column: 1 },
          end: { line: 1, column: 10 },
        },
      };
      const next: MarkdownNode = {};

      expect(sameNodePosition(prev, next)).toBe(false);
    });

    it('应该识别只有一个节点有 position (next 有)', () => {
      const prev: MarkdownNode = {};
      const next: MarkdownNode = {
        position: {
          start: { line: 1, column: 1 },
          end: { line: 1, column: 10 },
        },
      };

      expect(sameNodePosition(prev, next)).toBe(false);
    });

    it('应该处理部分缺失的位置信息', () => {
      const prev: MarkdownNode = {
        position: {
          start: { line: 1 }, // 缺少 column
          end: { line: 1 },
        },
      };

      const next: MarkdownNode = {
        position: {
          start: { line: 1 },
          end: { line: 1 },
        },
      };

      expect(sameNodePosition(prev, next)).toBe(true);
    });
  });
});

describe('sameClassAndNode', () => {
  it('应该比较 className 和节点位置', () => {
    const prev = {
      className: 'text-lg',
      node: {
        position: {
          start: { line: 1, column: 1 },
          end: { line: 1, column: 10 },
        },
      },
    };

    const next = {
      className: 'text-lg',
      node: {
        position: {
          start: { line: 1, column: 1 },
          end: { line: 1, column: 10 },
        },
      },
    };

    expect(sameClassAndNode(prev, next)).toBe(true);
  });

  it('应该识别不同的 className', () => {
    const prev = {
      className: 'text-lg',
      node: {
        position: {
          start: { line: 1, column: 1 },
          end: { line: 1, column: 10 },
        },
      },
    };

    const next = {
      className: 'text-xl',
      node: {
        position: {
          start: { line: 1, column: 1 },
          end: { line: 1, column: 10 },
        },
      },
    };

    expect(sameClassAndNode(prev, next)).toBe(false);
  });

  it('应该识别不同的节点位置', () => {
    const prev = {
      className: 'text-lg',
      node: {
        position: {
          start: { line: 1, column: 1 },
          end: { line: 1, column: 10 },
        },
      },
    };

    const next = {
      className: 'text-lg',
      node: {
        position: {
          start: { line: 2, column: 1 },
          end: { line: 2, column: 10 },
        },
      },
    };

    expect(sameClassAndNode(prev, next)).toBe(false);
  });

  it('应该处理缺少 node 的情况', () => {
    const prev = { className: 'text-lg' };
    const next = { className: 'text-lg' };

    expect(sameClassAndNode(prev, next)).toBe(true);
  });
});
