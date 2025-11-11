import type { BundledLanguage, BundledTheme } from 'shiki';

/**
 * 语言导入注册表
 * 
 * 使用静态导入映射解决动态导入在 Turbopack 中的兼容性问题
 * 支持 30+ 种常用编程语言
 * 
 * 注意：返回类型使用 any 是因为 Shiki 的模块导入返回整个模块对象
 * createHighlighterCore 会自动处理这些导入
 */
const LANGUAGE_REGISTRY: Record<
  string,
  // biome-ignore lint: Shiki 需要模块导入，不是直接的 LanguageRegistration
  () => Promise<any>
> = {
  javascript: () => import('shiki/langs/javascript.mjs'),
  js: () => import('shiki/langs/javascript.mjs'),
  typescript: () => import('shiki/langs/typescript.mjs'),
  ts: () => import('shiki/langs/typescript.mjs'),
  tsx: () => import('shiki/langs/tsx.mjs'),
  jsx: () => import('shiki/langs/jsx.mjs'),
  python: () => import('shiki/langs/python.mjs'),
  py: () => import('shiki/langs/python.mjs'),
  java: () => import('shiki/langs/java.mjs'),
  json: () => import('shiki/langs/json.mjs'),
  html: () => import('shiki/langs/html.mjs'),
  css: () => import('shiki/langs/css.mjs'),
  bash: () => import('shiki/langs/bash.mjs'),
  sh: () => import('shiki/langs/bash.mjs'),
  shell: () => import('shiki/langs/shell.mjs'),
  sql: () => import('shiki/langs/sql.mjs'),
  markdown: () => import('shiki/langs/markdown.mjs'),
  md: () => import('shiki/langs/markdown.mjs'),
  go: () => import('shiki/langs/go.mjs'),
  rust: () => import('shiki/langs/rust.mjs'),
  rs: () => import('shiki/langs/rust.mjs'),
  c: () => import('shiki/langs/c.mjs'),
  cpp: () => import('shiki/langs/cpp.mjs'),
  'c++': () => import('shiki/langs/cpp.mjs'),
  csharp: () => import('shiki/langs/csharp.mjs'),
  'c#': () => import('shiki/langs/csharp.mjs'),
  cs: () => import('shiki/langs/csharp.mjs'),
  php: () => import('shiki/langs/php.mjs'),
  ruby: () => import('shiki/langs/ruby.mjs'),
  rb: () => import('shiki/langs/ruby.mjs'),
  swift: () => import('shiki/langs/swift.mjs'),
  kotlin: () => import('shiki/langs/kotlin.mjs'),
  kt: () => import('shiki/langs/kotlin.mjs'),
  yaml: () => import('shiki/langs/yaml.mjs'),
  yml: () => import('shiki/langs/yaml.mjs'),
  xml: () => import('shiki/langs/xml.mjs'),
  dockerfile: () => import('shiki/langs/dockerfile.mjs'),
  graphql: () => import('shiki/langs/graphql.mjs'),
  gql: () => import('shiki/langs/graphql.mjs'),
  terraform: () => import('shiki/langs/terraform.mjs'),
  tf: () => import('shiki/langs/terraform.mjs'),
  lua: () => import('shiki/langs/lua.mjs'),
  r: () => import('shiki/langs/r.mjs'),
  scala: () => import('shiki/langs/scala.mjs'),
  elixir: () => import('shiki/langs/elixir.mjs'),
  ex: () => import('shiki/langs/elixir.mjs'),
  dart: () => import('shiki/langs/dart.mjs'),
  vue: () => import('shiki/langs/vue.mjs'),
  svelte: () => import('shiki/langs/svelte.mjs'),
  astro: () => import('shiki/langs/astro.mjs'),
};

/**
 * 主题导入注册表
 */
const THEME_REGISTRY: Record<
  string,
  // biome-ignore lint: Shiki 需要模块导入，不是直接的 ThemeRegistration
  () => Promise<any>
> = {
  'github-light': () => import('shiki/themes/github-light.mjs'),
  'github-dark': () => import('shiki/themes/github-dark.mjs'),
  'github-dark-dimmed': () => import('shiki/themes/github-dark-dimmed.mjs'),
  'dracula': () => import('shiki/themes/dracula.mjs'),
  'monokai': () => import('shiki/themes/monokai.mjs'),
  'nord': () => import('shiki/themes/nord.mjs'),
  'one-dark-pro': () => import('shiki/themes/one-dark-pro.mjs'),
  'solarized-light': () => import('shiki/themes/solarized-light.mjs'),
  'solarized-dark': () => import('shiki/themes/solarized-dark.mjs'),
  'vitesse-light': () => import('shiki/themes/vitesse-light.mjs'),
  'vitesse-dark': () => import('shiki/themes/vitesse-dark.mjs'),
};

/**
 * 获取语言的静态导入函数
 * 
 * @param lang - 语言标识符（如 'javascript', 'python'）
 * @returns 语言模块导入的 Promise
 */
// biome-ignore lint: 返回类型是模块对象，由 Shiki 内部处理
export function getLanguageImport(lang: BundledLanguage): Promise<any> {
  const normalizedLang = lang.toLowerCase();
  const importFn = LANGUAGE_REGISTRY[normalizedLang];
  
  if (!importFn) {
    console.warn(`[Shiki] Language "${lang}" not found in registry, falling back to plain text`);
    return import('shiki/langs/javascript.mjs');
  }
  
  return importFn();
}

/**
 * 获取主题的静态导入函数
 * 
 * @param theme - 主题标识符（如 'github-light', 'dracula'）
 * @returns 主题模块导入的 Promise
 */
// biome-ignore lint: 返回类型是模块对象，由 Shiki 内部处理
export function getThemeImport(theme: BundledTheme): Promise<any> {
  const normalizedTheme = theme.toLowerCase();
  const importFn = THEME_REGISTRY[normalizedTheme];
  
  if (!importFn) {
    console.warn(`[Shiki] Theme "${theme}" not found in registry, falling back to github-light`);
    return import('shiki/themes/github-light.mjs');
  }
  
  return importFn();
}

/**
 * 检查语言是否在注册表中
 */
export function isLanguageSupported(lang: string): boolean {
  return lang.toLowerCase() in LANGUAGE_REGISTRY;
}

/**
 * 检查主题是否在注册表中
 */
export function isThemeSupported(theme: string): boolean {
  return theme.toLowerCase() in THEME_REGISTRY;
}

/**
 * 获取所有支持的语言列表
 */
export function getSupportedLanguages(): string[] {
  return Object.keys(LANGUAGE_REGISTRY);
}

/**
 * 获取所有支持的主题列表
 */
export function getSupportedThemes(): string[] {
  return Object.keys(THEME_REGISTRY);
}
