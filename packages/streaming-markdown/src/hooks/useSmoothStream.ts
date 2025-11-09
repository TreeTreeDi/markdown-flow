import { useCallback, useEffect, useRef } from 'react';

export interface UseSmoothStreamOptions {
  onUpdate: (text: string) => void;
  streamDone: boolean;
  minDelay?: number;
  initialText?: string;
  onComplete?: () => void;
}

const segmenter = new Intl.Segmenter(['en', 'zh', 'ja', 'ru', 'fr', 'de'], {
  granularity: 'grapheme',
});

export function useSmoothStream({
  onUpdate,
  streamDone,
  minDelay = 10,
  initialText = '',
  onComplete,
}: UseSmoothStreamOptions) {
  const chunkQueueRef = useRef<string[]>([]);
  const displayedTextRef = useRef(initialText);
  const lastUpdateTimeRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const completedRef = useRef(false);

  const onUpdateRef = useRef(onUpdate);
  const onCompleteRef = useRef(onComplete);
  const streamDoneRef = useRef(streamDone);
  const minDelayRef = useRef(minDelay);

  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const renderLoopRef = useRef<((time: number) => void) | null>(null);

  useEffect(() => {
    streamDoneRef.current = streamDone;
    if (streamDone) {
      if (chunkQueueRef.current.length === 0 && !completedRef.current) {
        completedRef.current = true;
        onCompleteRef.current?.();
      } else if (!animationFrameRef.current && renderLoopRef.current) {
        animationFrameRef.current = requestAnimationFrame(renderLoopRef.current);
      }
    }
  }, [streamDone]);

  useEffect(() => {
    minDelayRef.current = minDelay;
  }, [minDelay]);

  useEffect(() => {
    if (initialText) {
      onUpdateRef.current(initialText);
    }
  }, [initialText]);

  const renderLoop = useCallback((currentTime: number) => {
    const queue = chunkQueueRef.current;
    const hasQueue = queue.length > 0;

    if (!hasQueue) {
      if (streamDoneRef.current && !completedRef.current) {
        completedRef.current = true;
        onCompleteRef.current?.();
        animationFrameRef.current = null;
        return;
      }
      animationFrameRef.current = null;
      return;
    }

    if (currentTime - lastUpdateTimeRef.current < minDelayRef.current) {
      animationFrameRef.current = requestAnimationFrame(renderLoop);
      return;
    }
    lastUpdateTimeRef.current = currentTime;

    let count = Math.max(1, Math.floor(queue.length / 5));
    if (streamDoneRef.current) {
      count = queue.length;
    }

    const next = queue.splice(0, count).join('');
    displayedTextRef.current += next;
    onUpdateRef.current(displayedTextRef.current);

    animationFrameRef.current = requestAnimationFrame(renderLoop);
  }, []);

  useEffect(() => {
    renderLoopRef.current = renderLoop;
  }, [renderLoop]);

  const addChunk = useCallback(
    (chunk: string) => {
      if (!chunk) {
        return;
      }
      const segments = Array.from(segmenter.segment(chunk)).map((s) => s.segment);
      chunkQueueRef.current.push(...segments);
      if (!animationFrameRef.current) {
        animationFrameRef.current = requestAnimationFrame(renderLoop);
      }
    },
    [renderLoop]
  );

  const reset = useCallback((newText = '') => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    chunkQueueRef.current = [];
    displayedTextRef.current = newText;
    completedRef.current = false;
    onUpdateRef.current(newText);
  }, []);

  useEffect(
    () => () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    },
    []
  );

  return { addChunk, reset };
}
