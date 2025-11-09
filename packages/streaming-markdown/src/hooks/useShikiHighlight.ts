import { useEffect, useState } from 'react';
import type { BundledLanguage, BundledTheme, HighlighterCore } from 'shiki';
import { createHighlighterCore } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';

interface UseShikiHighlightOptions {
  code: string;
  language?: string;
  theme?: 'light' | 'dark';
}

interface UseShikiHighlightResult {
  html: string;
  isLoading: boolean;
  error: Error | null;
}

let highlighterPromise: Promise<HighlighterCore> | undefined;

async function getHighlighter(): Promise<HighlighterCore> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighterCore({
      themes: [
        import('shiki/themes/github-light.mjs'),
        import('shiki/themes/github-dark.mjs'),
      ],
      langs: [
        import('shiki/langs/javascript.mjs'),
        import('shiki/langs/typescript.mjs'),
        import('shiki/langs/tsx.mjs'),
        import('shiki/langs/jsx.mjs'),
        import('shiki/langs/python.mjs'),
        import('shiki/langs/java.mjs'),
        import('shiki/langs/json.mjs'),
        import('shiki/langs/html.mjs'),
        import('shiki/langs/css.mjs'),
        import('shiki/langs/bash.mjs'),
        import('shiki/langs/shell.mjs'),
        import('shiki/langs/sql.mjs'),
        import('shiki/langs/markdown.mjs'),
        import('shiki/langs/go.mjs'),
        import('shiki/langs/rust.mjs'),
        import('shiki/langs/c.mjs'),
        import('shiki/langs/cpp.mjs'),
        import('shiki/langs/csharp.mjs'),
        import('shiki/langs/php.mjs'),
        import('shiki/langs/ruby.mjs'),
        import('shiki/langs/swift.mjs'),
        import('shiki/langs/kotlin.mjs'),
        import('shiki/langs/yaml.mjs'),
        import('shiki/langs/xml.mjs'),
        import('shiki/langs/dockerfile.mjs'),
      ],
      engine: createJavaScriptRegexEngine(),
    });
  }
  return highlighterPromise;
}

export function useShikiHighlight({
  code,
  language = 'text',
  theme = 'light',
}: UseShikiHighlightOptions): UseShikiHighlightResult {
  const [html, setHtml] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function highlight() {
      try {
        setIsLoading(true);
        setError(null);

        const highlighter = await getHighlighter();

        if (cancelled) return;

        const normalizedLang = language.toLowerCase() as BundledLanguage;

        if (cancelled) return;

        const themeName = (theme === 'dark' ? 'github-dark' : 'github-light') as BundledTheme;

        const highlighted = highlighter.codeToHtml(code, {
          lang: normalizedLang,
          theme: themeName,
        });

        if (!cancelled) {
          setHtml(highlighted);
          setIsLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setIsLoading(false);
          setHtml(`<pre><code>${escapeHtml(code)}</code></pre>`);
        }
      }
    }

    highlight();

    return () => {
      cancelled = true;
    };
  }, [code, language, theme]);

  return { html, isLoading, error };
}

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
