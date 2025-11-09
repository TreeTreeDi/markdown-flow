# streaming-markdown-react

适用于流式 Markdown 与 AI 聊天界面的 React 组件集合。

[![npm version](https://img.shields.io/npm/v/streaming-markdown-react.svg)](https://www.npmjs.com/package/streaming-markdown-react)
[![npm downloads](https://img.shields.io/npm/dm/streaming-markdown-react.svg)](https://www.npmjs.com/package/streaming-markdown-react)

> English version: [README.md](./README.md)

## 功能亮点
- **流式安全渲染**：`useSmoothStream` 以 `Intl.Segmenter` 逐字队列，避免代码块或 Markdown 结构被截断。
- **Shiki 代码高亮**：`useShikiHighlight` 按需加载主题与语言，未加载完成前优雅回退。
- **消息块模型**：`MessageItem`、`MessageBlockRenderer`、`MessageBlockStore` 支持思考、工具调用、媒体等复杂回复结构。
- **高度可定制**：透传 `react-markdown` 的 `components`，可替换默认 `CodeBlock`，也可自定义主题与回调。
- **轻量 API**：注入字符串流与 `status` 即可完成实时渲染，并在 `onComplete` 中获取完成回调。

## 安装

```bash
pnpm add streaming-markdown-react
# 或
npm install streaming-markdown-react
# 或
yarn add streaming-markdown-react
```

## 基础用法

```tsx
import { StreamingMarkdown, StreamingStatus } from 'streaming-markdown-react';

export function MessageBubble({
  text,
  status,
}: {
  text: string;
  status: StreamingStatus;
}) {
  return (
    <StreamingMarkdown
      status={status}
      className="prose prose-neutral max-w-none"
      onComplete={() => console.log('stream finished')}
    >
      {text}
    </StreamingMarkdown>
  );
}
```

将最新的 Markdown 文本通过 `children` 传入，在生成阶段把 `status` 设为 `streaming`，结束后自动触发 `onComplete`。

## 流式输入示例

```tsx
import { useState, useEffect } from 'react';
import { StreamingMarkdown, StreamingStatus } from 'streaming-markdown-react';

export function LiveAssistantMessage({ stream }: { stream: ReadableStream<string> }) {
  const [text, setText] = useState('');
  const [status, setStatus] = useState<StreamingStatus>('streaming');

  useEffect(() => {
    const reader = stream.getReader();
    let cancelled = false;

    async function read() {
      while (!cancelled) {
        const { value, done } = await reader.read();
        if (done) {
          setStatus('success');
          break;
        }
        setText((prev) => prev + (value ?? ''));
      }
    }

    read();
    return () => {
      cancelled = true;
      reader.releaseLock();
    };
  }, [stream]);

  return (
    <StreamingMarkdown
      status={status}
      minDelay={12}
      onComplete={() => console.log('assistant block done')}
    >
      {text}
    </StreamingMarkdown>
  );
}
```

`minDelay` 控制字符刷新节奏；当上游流结束时，将 `status` 切换为 `success` 可以触发收尾逻辑。

## 组件与 Hook

| 导出项 | 说明 |
| --- | --- |
| `StreamingMarkdown` | 支持 GFM 与自定义节点的流式安全 Markdown 渲染器。 |
| `StreamingStatus` | `'idle' \| 'streaming' \| 'success' \| 'error'` 状态联合类型。 |
| `MessageItem` | 将助手回复拆分为类型化消息块并写入 `MessageBlockStore`。 |
| `MessageBlockRenderer` | 针对文本、思考、工具、媒体、错误等 block 提供默认渲染。 |
| `MessageBlockStore` | 轻量内存存储，方便 diff 与客户端回放。 |
| `useSmoothStream` | 基于 `Intl.Segmenter` 的多语言字素级流式队列。 |
| `useShikiHighlight` | 支持明暗主题的懒加载 Shiki 高亮。 |
| `CodeBlock` | 默认代码块组件，可根据 UI 需要替换或封装。 |

## StreamingMarkdown 参数

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `children` | `ReactNode` | 需要渲染的 Markdown 文本，可为未完成片段。 |
| `className` | `string` | 容器样式类名。 |
| `components` | `Partial<Components>` | 覆盖 `react-markdown` 的渲染节点。 |
| `status` | `StreamingStatus` | 控制内部流式生命周期。 |
| `onComplete` | `() => void` | 流结束且队列清空后触发。 |
| `minDelay` | `number` | 帧之间的最小间隔（默认 `10ms`）。 |
| `blockId` | `string` | 预留给多 block 对齐与同步。 |

## 自定义扩展

- **重写 Markdown 节点**：传入 `components`，实现提示块、Callout、定制排版等高级 UI。
- **主题敏感的代码块**：直接使用导出的 `CodeBlock`，或搭配 `useShikiHighlight` 构建符合品牌风格的代码展示。
- **消息优先 UI**：`MessageItem` 与 `MessageBlockRenderer` 可在聊天记录中保持 block 级同步，适合增量渲染或流式差异化更新。

## 类型安全的消息块

已导出所有消息相关类型（`Message`, `MessageBlock`, `MessageMetadata` 等），可在后端与前端共享，保证 streaming 渲染与业务逻辑一致。

```ts
import type { Message, MessageBlockType } from 'streaming-markdown-react';

const assistant: Message = {
  id: 'msg-1',
  role: 'assistant',
  blocks: [
    {
      id: 'block-1',
      type: MessageBlockType.MAIN_TEXT,
      content: 'Here is your SQL query...',
    },
  ],
};
```

## 许可协议

MIT © 2024-present。欢迎在生产或开源项目中使用。
