# Implementation Tasks

## 1. Core Utility Functions
- [ ] 1.1 实现 `parseMarkdownIntoBlocks()` 函数
  - [ ] 1.1.1 添加脚注检测逻辑（正则匹配 `[^id]` 和 `[^id]:`）
  - [ ] 1.1.2 使用 `marked` Lexer 进行 token 分析
  - [ ] 1.1.3 实现 HTML 标签栈匹配（开标签入栈，闭标签出栈）
  - [ ] 1.1.4 实现数学公式块配对（`$` 计数，奇数时合并）
  - [ ] 1.1.5 返回 `MessageBlock[]` 类型的 block 数组
- [ ] 1.2 实现 `sameNodePosition()` AST 位置比较函数
  - [ ] 1.2.1 比较 `start.line`, `start.column`, `end.line`, `end.column`
  - [ ] 1.2.2 处理 `position` 为 `undefined` 的边界情况
- [ ] 1.3 编写单元测试
  - [ ] 1.3.1 测试 `parseMarkdownIntoBlocks()` 的 8 个场景
  - [ ] 1.3.2 测试 `sameNodePosition()` 的 3 个场景
  - [ ] 1.3.3 确保 `tsc --noEmit` 通过

## 2. Shiki Highlighter Manager
- [ ] 2.1 创建 `ShikiHighlighterManager` 类
  - [ ] 2.1.1 定义 `lightHighlighter` 和 `darkHighlighter` 私有属性
  - [ ] 2.1.2 定义 `loadedLanguages: Set<BundledLanguage>` 属性
  - [ ] 2.1.3 实现 `highlightCode()` 方法
    - 检测主题变化，重建 highlighter 实例
    - 按需加载语言（`loadLanguage()`）
    - 返回 `[lightHtml, darkHtml]` 元组
- [ ] 2.2 导出全局单例 `highlighterManager`
- [ ] 2.3 更新 `useShikiHighlight` hook 使用单例管理器
- [ ] 2.4 编写单元测试
  - [ ] 2.4.1 测试首次初始化
  - [ ] 2.4.2 测试实例复用
  - [ ] 2.4.3 测试语言按需加载
  - [ ] 2.4.4 测试主题切换重建

## 3. Layer 2 - Block Component
- [ ] 3.1 创建 `Block.tsx` 文件
  - [ ] 3.1.1 定义 `BlockProps` 接口（`content: string` + 其他 ReactMarkdown props）
  - [ ] 3.1.2 使用 `memo` 包裹组件，比较函数检查 `content` 是否相同
  - [ ] 3.1.3 渲染 `ReactMarkdown` 并传递自定义组件
- [ ] 3.2 编写单元测试
  - [ ] 3.2.1 测试 content 不变时跳过重渲染（使用 React Testing Library）
  - [ ] 3.2.2 测试 content 变化时触发重渲染

## 4. Layer 3 - Memoized Components
- [ ] 4.1 创建 `MemoizedComponents.tsx` 文件
  - [ ] 4.1.1 实现 `sameClassAndNode()` 比较函数（复用 `sameNodePosition`）
  - [ ] 4.1.2 创建 memoized 标题组件（h1-h6）
  - [ ] 4.1.3 创建 memoized 链接组件（额外比较 `href`）
  - [ ] 4.1.4 创建 memoized 段落/列表/引用等组件
  - [ ] 4.1.5 创建 memoized 代码块组件（集成 Shiki）
  - [ ] 4.1.6 导出 `defaultComponents` 对象
- [ ] 4.2 编写单元测试
  - [ ] 4.2.1 测试每个组件的 memo 比较逻辑
  - [ ] 4.2.2 测试 AST 位置不变时跳过重渲染

## 5. Layer 1 - StreamingMarkdown Integration
- [ ] 5.1 更新 `StreamingMarkdown.tsx`
  - [ ] 5.1.1 添加 `useMemo(() => parseMarkdownIntoBlocks(...), [markdown])`
  - [ ] 5.1.2 遍历 blocks 数组，渲染 `Block` 组件
  - [ ] 5.1.3 生成稳定的 `key`（使用 `useId` + block index）
  - [ ] 5.1.4 使用 `memo` 包裹整个组件，自定义比较 `children` 和 `status`
- [ ] 5.2 更新 `splitMarkdownIntoBlocks.ts` 实现
  - [ ] 5.2.1 替换占位实现为真实的分块逻辑
  - [ ] 5.2.2 确保返回类型为 `MessageBlock[]`
- [ ] 5.3 编写集成测试
  - [ ] 5.3.1 测试完整的流式渲染流程
  - [ ] 5.3.2 测试块级更新不影响其他块

## 6. MessageBlockRenderer Integration
- [ ] 6.1 更新 `MessageBlockRenderer.tsx`
  - [ ] 6.1.1 检查 `block.type === MessageBlockType.MAIN_TEXT` 时使用新的分块渲染
  - [ ] 6.1.2 确保其他 block type 的渲染逻辑不变
- [ ] 6.2 编写集成测试
  - [ ] 6.2.1 测试多 block 渲染
  - [ ] 6.2.2 测试不同 block type 的混合渲染

## 7. Type Definitions and Exports
- [ ] 7.1 更新 `index.ts` 导出
  - [ ] 7.1.1 导出 `Block` 组件和类型
  - [ ] 7.1.2 导出 `sameNodePosition` 工具函数
  - [ ] 7.1.3 导出 `ShikiHighlighterManager` 类型（如需要）
- [ ] 7.2 确保所有公开 API 有类型定义
- [ ] 7.3 运行 `pnpm lint` 确保类型检查通过

## 8. Testing and Validation
- [ ] 8.1 运行完整测试套件 `pnpm test`
- [ ] 8.2 生成测试覆盖率报告 `pnpm test:coverage`
- [ ] 8.3 确保核心函数覆盖率 >80%
- [ ] 8.4 运行 TypeScript 编译检查 `pnpm lint`

## 9. Performance Benchmarking
- [ ] 9.1 创建性能测试用例
  - [ ] 9.1.1 5000+ 字符 Markdown 文档
  - [ ] 9.1.2 包含 10+ 代码块的文档
  - [ ] 9.1.3 流式更新场景（每次追加 50 字符）
- [ ] 9.2 使用 React Profiler 测量渲染时间
- [ ] 9.3 使用 Chrome DevTools 测量内存占用
- [ ] 9.4 对比优化前后的性能数据
  - [ ] 9.4.1 初次渲染提升 ≥5x
  - [ ] 9.4.2 增量更新提升 ≥10x
  - [ ] 9.4.3 内存降低 ≥40%

## 10. Documentation
- [ ] 10.1 更新 `README.md` 添加性能优化说明
- [ ] 10.2 添加 JSDoc 注释到所有公开函数
- [ ] 10.3 创建性能优化示例代码（如需要）

## 11. Build and Release
- [ ] 11.1 运行 `pnpm build` 确保构建成功
- [ ] 11.2 检查 `dist/` 输出文件
- [ ] 11.3 验证 package.json 的 exports 配置
- [ ] 11.4 更新版本号（根据语义化版本规范）
