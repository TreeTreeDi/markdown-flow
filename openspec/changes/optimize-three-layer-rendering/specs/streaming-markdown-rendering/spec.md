# Streaming Markdown Rendering

## ADDED Requirements

### Requirement: Block Splitting with Syntax Preservation
The system SHALL split Markdown content into multiple blocks using Lexer token stream analysis while preserving syntax integrity for footnotes, HTML tags, and math formulas.

#### Scenario: Simple paragraph splitting
- **GIVEN** a Markdown string containing multiple paragraphs without cross-block syntax
- **WHEN** `parseMarkdownIntoBlocks()` is called
- **THEN** return an array of blocks, each containing one or more paragraphs as separate strings

#### Scenario: Footnote detection prevents splitting
- **GIVEN** a Markdown string containing footnote references `[^1]` or footnote definitions `[^1]:`
- **WHEN** `parseMarkdownIntoBlocks()` is called
- **THEN** return a single-element array containing the entire Markdown string

#### Scenario: HTML tag stack matching
- **GIVEN** a Markdown string with unclosed HTML tags like `<div>\n\ncontent\n\n</div>`
- **WHEN** `parseMarkdownIntoBlocks()` is called
- **THEN** merge all tokens between opening and closing tags into a single block

#### Scenario: Math formula pairing
- **GIVEN** a Markdown string with unclosed math delimiters like `$\nx^2\n` (odd number of `$`)
- **WHEN** `parseMarkdownIntoBlocks()` is called
- **THEN** merge subsequent tokens until the closing `$` is found

### Requirement: Three-Layer Memoization Architecture
The system SHALL implement three layers of memoization to optimize rendering performance: container-level, block-level, and component-level caching.

#### Scenario: Layer 1 - Container-level caching
- **GIVEN** the `StreamingMarkdown` component receives the same `children` prop
- **WHEN** React re-renders the parent component
- **THEN** the `useMemo` hook SHALL skip re-parsing and return the cached block array

#### Scenario: Layer 2 - Block-level caching
- **GIVEN** a `Block` component receives the same `content` prop
- **WHEN** other blocks in the same container are updated
- **THEN** the `memo` wrapper SHALL skip re-rendering this block

#### Scenario: Layer 3 - Component-level caching
- **GIVEN** a memoized heading component receives props with the same AST node position
- **WHEN** the block content is updated elsewhere
- **THEN** the `memo` comparison function SHALL return true and skip re-rendering

### Requirement: AST Node Position Comparison
The system SHALL provide a utility function to compare Markdown AST node positions for memoization optimization.

#### Scenario: Same position nodes
- **GIVEN** two AST nodes with identical `start.line`, `start.column`, `end.line`, and `end.column`
- **WHEN** `sameNodePosition(prev, next)` is called
- **THEN** return `true`

#### Scenario: Different position nodes
- **GIVEN** two AST nodes with different line or column numbers
- **WHEN** `sameNodePosition(prev, next)` is called
- **THEN** return `false`

#### Scenario: Missing position data
- **GIVEN** at least one node has no `position` property
- **WHEN** `sameNodePosition(prev, next)` is called
- **THEN** return `true` (assume no change)

### Requirement: Shiki Highlighter Singleton Management
The system SHALL implement a `ShikiHighlighterManager` singleton class to reuse Shiki highlighter instances and load languages on demand.

#### Scenario: First code block initialization
- **GIVEN** no highlighter instance exists for the light theme
- **WHEN** `highlightCode()` is called with language 'javascript'
- **THEN** create a new Shiki highlighter instance and load the 'javascript' language

#### Scenario: Reusing existing highlighter
- **GIVEN** a highlighter instance already exists for the light theme
- **WHEN** `highlightCode()` is called with language 'javascript' (already loaded)
- **THEN** reuse the existing instance without re-initialization

#### Scenario: Loading new language
- **GIVEN** a highlighter instance exists but language 'python' is not loaded
- **WHEN** `highlightCode()` is called with language 'python'
- **THEN** load the 'python' language into the existing instance and cache it

#### Scenario: Theme change triggers rebuild
- **GIVEN** a highlighter instance exists for theme 'github-light'
- **WHEN** `highlightCode()` is called with theme 'dracula'
- **THEN** create a new highlighter instance and clear the loaded languages cache

### Requirement: Block Component Rendering
The system SHALL provide a `Block` component that wraps individual Markdown blocks with memoization.

#### Scenario: Render single block
- **GIVEN** a block object with `content` property containing Markdown text
- **WHEN** the `Block` component is rendered
- **THEN** pass the content to `ReactMarkdown` with custom components

#### Scenario: Block content unchanged
- **GIVEN** a `Block` component has been rendered with specific content
- **WHEN** the parent re-renders but the block's `content` prop is identical
- **THEN** the memo comparison function SHALL prevent re-rendering

### Requirement: Memoized Markdown Components
The system SHALL provide memoized versions of all standard Markdown components (headings, links, code, etc.) that compare AST node positions.

#### Scenario: Heading component with same AST position
- **GIVEN** a memoized heading component with AST position data
- **WHEN** the component receives new props with identical `node.position` and `className`
- **THEN** skip re-rendering

#### Scenario: Link component with different href
- **GIVEN** a memoized link component
- **WHEN** the `href` prop changes while `node.position` remains the same
- **THEN** re-render the component

#### Scenario: Code block with same position
- **GIVEN** a memoized code block component
- **WHEN** the AST node position and language are unchanged
- **THEN** skip re-rendering and reuse the highlighted HTML

### Requirement: Type Safety and Testability
The system SHALL ensure all core functions are independently unit-testable and pass TypeScript compilation without errors.

#### Scenario: Standalone function testing
- **GIVEN** the `parseMarkdownIntoBlocks()` function
- **WHEN** unit tests import and call it with various Markdown strings
- **THEN** the function SHALL return correct block arrays without requiring React context

#### Scenario: TypeScript compilation
- **GIVEN** all source files in the package
- **WHEN** `tsc --noEmit` is executed
- **THEN** the compilation SHALL succeed with zero type errors

#### Scenario: Exported types consistency
- **GIVEN** the public API exports types like `MessageBlock`, `StreamingMarkdownProps`
- **WHEN** consumers import and use these types
- **THEN** TypeScript SHALL correctly infer and validate the types

### Requirement: Performance Metrics
The system SHALL achieve measurable performance improvements compared to the baseline single-block rendering approach.

#### Scenario: Initial rendering improvement
- **GIVEN** a Markdown document with 5000+ characters
- **WHEN** the document is rendered for the first time
- **THEN** the rendering time SHALL be at least 5x faster than the baseline

#### Scenario: Incremental update improvement
- **GIVEN** a streaming Markdown document that receives 50-character chunks
- **WHEN** a new chunk is added to the existing content
- **THEN** the update rendering time SHALL be at least 10x faster than the baseline

#### Scenario: Memory usage reduction
- **GIVEN** a document with multiple code blocks in the same language
- **WHEN** all blocks are rendered
- **THEN** the memory usage SHALL be reduced by at least 40% compared to the baseline
