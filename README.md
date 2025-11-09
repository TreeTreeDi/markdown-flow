# streaming-markdown-react

React components for streaming-safe Markdown and AI chat interfaces.

[![npm version](https://img.shields.io/npm/v/streaming-markdown-react.svg)](https://www.npmjs.com/package/streaming-markdown-react)
[![npm downloads](https://img.shields.io/npm/dm/streaming-markdown-react.svg)](https://www.npmjs.com/package/streaming-markdown-react)

> Prefer Chinese docs? See [README.zh-CN.md](./README.zh-CN.md).

## Highlights
- **Streaming-safe rendering**: `useSmoothStream` queues graphemes so partially streamed Markdown never breaks code fences or inline structures.
- **Shiki-powered code blocks**: `useShikiHighlight` lazy-loads themes and languages, falling back gracefully while syntax highlighting boots.
- **Message-aware primitives**: `MessageItem`, `MessageBlockRenderer`, and `MessageBlockStore` model complex assistant replies (thinking, tool calls, media, etc.).
- **Highly customizable**: Extend `react-markdown` via the `components` prop, swap the default `CodeBlock`, or plug in your own themes and callbacks.
- **Tiny API surface**: Stream text, toggle `status`, and receive `onComplete` when everything has flushed—no heavy state machines required.

## Installation

```bash
pnpm add streaming-markdown-react
# or
npm install streaming-markdown-react
# or
yarn add streaming-markdown-react
```

## Basic Usage

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

Pass the latest chunked Markdown through `children`, keep `status="streaming"` until the LLM closes the stream, and use `onComplete` for follow-up UI work once every queued token is painted.

## Streaming Example

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

`minDelay` throttles animation frames for high-throughput streams, while `status` flips to `'success'` the moment upstream tokenization ends.

## Components & Hooks

| Export | Description |
| --- | --- |
| `StreamingMarkdown` | Streaming-safe Markdown renderer with GFM and overridable components. |
| `StreamingStatus` | `'idle' \| 'streaming' \| 'success' \| 'error'` helper union for UI state. |
| `MessageItem` | Splits assistant responses into typed blocks backed by `MessageBlockStore`. |
| `MessageBlockRenderer` | Default renderer for text, thinking, tool, media, and error blocks. |
| `MessageBlockStore` | Lightweight in-memory store for diffing and hydrating message blocks. |
| `useSmoothStream` | Grapheme-level streaming queue powered by `Intl.Segmenter`. |
| `useShikiHighlight` | Lazy-loaded Shiki highlighter with light/dark themes. |
| `CodeBlock` | Default code block component; wrap or replace it for custom UI. |

## StreamingMarkdown Props

| Prop | Type | Description |
| --- | --- | --- |
| `children` | `ReactNode` | Markdown (partial or complete) to render. |
| `className` | `string` | Utility classes for the container. |
| `components` | `Partial<Components>` | Extend/override `react-markdown` element renderers. |
| `status` | `StreamingStatus` | Controls the internal streaming lifecycle. |
| `onComplete` | `() => void` | Fires once the queue drains after the stream finishes. |
| `minDelay` | `number` | Minimum milliseconds between animation frames (default `10`). |
| `blockId` | `string` | Reserved for coordinating multi-block updates. |

## Customization

- **Override Markdown elements**: provide a `components` map to inject callouts, alerts, or custom typography.

  ```tsx
  <StreamingMarkdown
    components={{
      blockquote: (props) => (
        <div className="rounded-lg border-l-4 border-amber-500 bg-amber-50 p-3 text-sm">
          {props.children}
        </div>
      ),
    }}
  >
    {text}
  </StreamingMarkdown>
  ```

- **Theme-aware code blocks**: use the exported `CodeBlock` or compose `useShikiHighlight` with your own chrome.

  ```tsx
  import { CodeBlock, useShikiHighlight } from 'streaming-markdown-react';
  ```

- **Message-first UIs**: `MessageItem` and `MessageBlockRenderer` coordinate per-block rendering so chat transcripts stay in sync during streaming diffs.

## Type-safe Message Blocks

All message-related types (`Message`, `MessageBlock`, `MessageMetadata`, etc.) are exported so your AI pipeline and UI can share a single contract.

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

## Development Playground

This repository also serves as a **development playground** for `streaming-markdown-react`. The root project is a full-featured Next.js AI Chatbot that demonstrates the package in action.

### Playground Features

- [Next.js](https://nextjs.org) App Router with React Server Components
- [AI SDK](https://ai-sdk.dev/docs/introduction) integration with xAI (Grok) models via Vercel AI Gateway
- [shadcn/ui](https://ui.shadcn.com) components styled with Tailwind CSS
- [Neon Serverless Postgres](https://vercel.com/marketplace/neon) for chat history
- [Vercel Blob](https://vercel.com/storage/blob) for file storage
- [Auth.js](https://authjs.dev) authentication

### Running the Playground Locally

1. Install dependencies:
```bash
pnpm install
```

2. Set up environment variables (see `.env.example`):
```bash
# For Vercel users:
vercel env pull

# Or manually create .env.local with:
# - POSTGRES_URL
# - AUTH_SECRET
# - AI_GATEWAY_API_KEY (for non-Vercel deployments)
```

3. Run database migrations:
```bash
pnpm db:migrate
```

4. Start the development server:
```bash
pnpm dev
```

The playground will run on [localhost:4000](http://localhost:4000).

### Development Commands

```bash
pnpm dev                 # Start dev server
pnpm build              # Build for production
pnpm lint               # Check code with Ultracite
pnpm format             # Auto-fix code

# Database (Drizzle ORM)
pnpm db:migrate         # Apply migrations
pnpm db:generate        # Generate new migrations
pnpm db:studio          # Open Drizzle Studio GUI

# Testing
pnpm test               # Run Playwright e2e tests
```

For detailed development instructions, see [packages/streaming-markdown/README.md](packages/streaming-markdown/README.md).

## License

MIT © 2024-present. Feel free to use it in production or open-source projects.
