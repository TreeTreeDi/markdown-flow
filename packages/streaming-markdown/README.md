# @stream-md/react

React component for rendering streaming markdown content with proper handling of incomplete code blocks.

## Installation

```bash
pnpm add @stream-md/react
```

## Usage

```tsx
import { StreamingMarkdown } from '@stream-md/react';

function ChatMessage({ content }: { content: string }) {
  return <StreamingMarkdown content={content} />;
}
```

## API

### Props

- `content: string` - Markdown content to render (can be incomplete during streaming)
- `className?: string` - Optional CSS class name
- `components?: Partial<Components>` - Custom react-markdown components
- `onComplete?: () => void` - Callback when streaming completes

## Features

- ✅ Handles incomplete code blocks during streaming
- ✅ GitHub Flavored Markdown (tables, strikethrough, etc.)
- ✅ Type-safe with TypeScript
- ✅ Zero runtime overhead
- ✅ Customizable rendering via components prop

## License

MIT
