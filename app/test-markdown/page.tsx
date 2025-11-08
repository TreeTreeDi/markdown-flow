'use client';

import { StreamingMarkdown } from '@stream-md/react';
import { useState, useEffect } from 'react';

export default function TestMarkdownPage() {
  const [content, setContent] = useState('');
  
  useEffect(() => {
    const fullText = `# Streaming Markdown Test

This is a **bold** and *italic* text.

## Code Block

\`\`\`typescript
function hello(name: string) {
  console.log(\`Hello, \${name}!\`);
}
\`\`\`

## List

- Item 1
- Item 2
- Item 3

## Table

| Name | Age | City |
|------|-----|------|
| Alice | 30 | NYC |
| Bob | 25 | LA |

> This is a blockquote

\`\`\`python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
\`\`\`
`;

    let index = 0;
    const interval = setInterval(() => {
      if (index < fullText.length) {
        setContent(fullText.slice(0, index + 1));
        index += 1;
      } else {
        clearInterval(interval);
      }
    }, 10);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen p-8 bg-background">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Streaming Markdown Playground</h1>
        
        <div className="border rounded-lg p-6 bg-card">
          <StreamingMarkdown 
            content={content}
            className="prose dark:prose-invert max-w-none"
          />
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          Characters: {content.length}
        </div>
      </div>
    </div>
  );
}
