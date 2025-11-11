# 三层渲染优化与 Block 切分

## Why

当前 `@packages/streaming-markdown` 在流式渲染 Markdown 时，整个内容作为单一 block 处理，导致每次增量更新都触发完整的 AST 解析和组件树重渲染。对于长文本（>5000 字符）或包含多个代码块的内容，这会造成显著的性能瓶颈，表现为：
1. 渲染延迟随文本长度线性增长
2. 大量不必要的 React 组件 re-render
3. 代码高亮（Shiki）重复初始化和语言加载

## What Changes

实现基于三层 Memoization 的性能优化架构，包括：

1. **Block 切分机制**
   - 在 `splitMarkdownIntoBlocks` 实现智能分块（避免破坏脚注、HTML 标签、数学公式）
   - 使用 `unified` + `remark-parse` 的 Lexer 进行 token 级别切分
   - 处理 HTML 块栈匹配、数学块配对

2. **三层 Memoization**
   - Layer 1 (顶层): `StreamingMarkdown` 组件使用 `useMemo` 缓存分块结果
   - Layer 2 (块级): 每个 Block 组件用 `memo` + content 比较
   - Layer 3 (原子): 所有叶子组件（heading/link/code/table 等）使用 `memo` + AST 位置比较

3. **代码高亮优化**
   - 创建 `ShikiHighlighterManager` 单例类
   - 复用 highlighter 实例，按需加载语言
   - 避免重复初始化 8MB+ 的 Shiki engine

4. **类型安全与可测试性**
   - 所有核心函数可独立单元测试
   - 确保 `tsc --noEmit` 通过
   - 不引入 Mermaid 等额外功能

## Impact

### Affected Specs
- `streaming-markdown-rendering` (新增)

### Affected Code
- `packages/streaming-markdown/src/utils/markdown/splitMarkdownIntoBlocks.ts` - 核心分块逻辑
- `packages/streaming-markdown/src/components/Markdown/StreamingMarkdown.tsx` - Layer 1 优化
- `packages/streaming-markdown/src/components/Markdown/Block.tsx` - 新增 Layer 2 组件
- `packages/streaming-markdown/src/components/Markdown/MemoizedComponents.tsx` - 新增 Layer 3 原子组件
- `packages/streaming-markdown/src/hooks/useShikiHighlight.ts` - 单例管理器

### Performance Targets
- 初次渲染提升: 5x ~ 8x
- 增量更新提升: 10x ~ 30x
- 内存占用降低: 40% ~ 60%

### Breaking Changes
**BREAKING**: `splitMarkdownIntoBlocks` 的返回类型从单一 block 改为 block 数组，需要更新调用侧的类型定义。
