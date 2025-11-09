import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useSmoothStream } from '../hooks/useSmoothStream';

describe('useSmoothStream', () => {
  beforeEach(() => {
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      setTimeout(() => cb(performance.now()), 0);
      return 1;
    });
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('应该初始化为空文本', () => {
    const onUpdate = vi.fn();
    const { result } = renderHook(() =>
      useSmoothStream({
        onUpdate,
        streamDone: false,
      })
    );

    expect(result.current).toHaveProperty('addChunk');
    expect(result.current).toHaveProperty('reset');
  });

  it('应该初始化为指定文本', () => {
    const onUpdate = vi.fn();
    renderHook(() =>
      useSmoothStream({
        onUpdate,
        streamDone: false,
        initialText: 'Hello',
      })
    );

    expect(onUpdate).toHaveBeenCalledWith('Hello');
  });

  it('应该通过 addChunk 添加文本块', async () => {
    const onUpdate = vi.fn();
    const { result } = renderHook(() =>
      useSmoothStream({
        onUpdate,
        streamDone: false,
      })
    );

    await act(async () => {
      result.current.addChunk('Hello');
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    expect(onUpdate).toHaveBeenCalled();
    expect(onUpdate.mock.calls.some((call) => call[0].includes('Hello'))).toBe(true);
  });

  it('应该通过 reset 立即替换文本', async () => {
    const onUpdate = vi.fn();
    const { result } = renderHook(() =>
      useSmoothStream({
        onUpdate,
        streamDone: false,
      })
    );

    await act(async () => {
      result.current.addChunk('Old text');
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    onUpdate.mockClear();

    act(() => {
      result.current.reset('New text');
    });

    expect(onUpdate).toHaveBeenCalledWith('New text');
  });

  it('应该忽略空字符串', () => {
    const onUpdate = vi.fn();
    const { result } = renderHook(() =>
      useSmoothStream({
        onUpdate,
        streamDone: false,
      })
    );

    const callCount = onUpdate.mock.calls.length;

    act(() => {
      result.current.addChunk('');
    });

    expect(onUpdate.mock.calls.length).toBe(callCount);
  });

  it('应该在 streamDone 时调用 onComplete', async () => {
    const onUpdate = vi.fn();
    const onComplete = vi.fn();
    const { rerender } = renderHook(
      ({ streamDone }) =>
        useSmoothStream({
          onUpdate,
          streamDone,
          onComplete,
          initialText: '',
        }),
      { initialProps: { streamDone: false } }
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    await act(async () => {
      rerender({ streamDone: true });
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    expect(onComplete).toHaveBeenCalled();
  });

  it('应该正确处理多语言字符（emoji、中文）', async () => {
    const onUpdate = vi.fn();
    const { result } = renderHook(() =>
      useSmoothStream({
        onUpdate,
        streamDone: false,
      })
    );

    await act(async () => {
      result.current.addChunk('你好👋世界');
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    expect(onUpdate).toHaveBeenCalled();
    const lastCall = onUpdate.mock.calls[onUpdate.mock.calls.length - 1][0];
    expect(lastCall).toContain('你好');
  });

  it('reset 应该清空队列并取消 RAF', () => {
    const onUpdate = vi.fn();
    const { result } = renderHook(() =>
      useSmoothStream({
        onUpdate,
        streamDone: false,
      })
    );

    act(() => {
      result.current.addChunk('Queue this');
      result.current.reset('Reset immediately');
    });

    expect(onUpdate).toHaveBeenCalledWith('Reset immediately');
  });

  it('应该在组件卸载时清理 RAF', async () => {
    const onUpdate = vi.fn();
    const cancelSpy = vi.fn();
    vi.stubGlobal('cancelAnimationFrame', cancelSpy);

    const { result, unmount } = renderHook(() =>
      useSmoothStream({
        onUpdate,
        streamDone: false,
      })
    );

    await act(async () => {
      result.current.addChunk('Test');
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    unmount();

    expect(cancelSpy).toHaveBeenCalled();
  });
});
