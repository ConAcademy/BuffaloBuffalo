# PLAN.md - Implementation Plan

## Phase 1: Foundation

### 1.1 Project Setup
- [ ] Initialize TypeScript project with strict mode
- [ ] Configure build tooling (esbuild or vite for simplicity)
- [ ] Set up test framework (vitest)
- [ ] Create folder structure: `src/parser`, `src/viz`, `src/web`, `src/llm`

### 1.2 Type Definitions
- [ ] Define `PartOfSpeech` enum
- [ ] Define `LexiconEntry` interface
- [ ] Define `ParseTree` and `ParseNode` types
- [ ] Define `GrammarRule` type for CFG rules

## Phase 2: Parse Tree Generator

### 2.1 Lexicon System
- [ ] Create `Lexicon` class with word lookup
- [ ] Implement `addWord(word, pos, features?)` method
- [ ] Implement `lookup(word): LexiconEntry[]` returning all POS options
- [ ] Create test lexicon with common English words (not Buffalo)

### 2.2 Grammar Rules
- [ ] Define CFG rules for English sentence structure
- [ ] S → NP VP (basic sentence)
- [ ] NP → (DET) (ADJ)* N (PP)* (relative clause)
- [ ] VP → V (NP) (PP)*
- [ ] Relative clause → (that/which) S | reduced relative
- [ ] Handle reduced relative clauses (critical for Buffalo sentences)

### 2.3 Parser Implementation
- [ ] Implement CYK or Earley parser for ambiguous grammars
- [ ] Return all valid parse trees (not just first match)
- [ ] Add probability/preference scoring for ranking parses
- [ ] Handle unknown words gracefully

### 2.4 Parser Testing
- [ ] Write unit tests with non-Buffalo sentences
- [ ] Test: "The dog chased the cat"
- [ ] Test: "The man who the dog bit ran away"
- [ ] Test ambiguous sentences with multiple valid parses
- [ ] Verify all expected parses are returned

### 2.5 Buffalo Dictionary
- [ ] Create Buffalo-only lexicon
- [ ] `Buffalo` → NP (proper noun, city)
- [ ] `buffalo` → N (noun, animal)
- [ ] `buffalo` → V (verb, to intimidate)
- [ ] Test with known Buffalo sentence parses

## Phase 3: Visualization

### 3.1 Diagram Generator
- [ ] Design SVG-based Reed-Kellogg diagram renderer
- [ ] Horizontal baseline for S-V-O
- [ ] Diagonal lines for modifiers
- [ ] Vertical lines separating subject/predicate
- [ ] Pedestals for subordinate clauses

### 3.2 Render Implementation
- [ ] `renderTree(parseTree): SVGElement`
- [ ] Calculate layout dimensions dynamically
- [ ] Support zooming/panning for complex sentences
- [ ] Add CSS classes for interactive highlighting

### 3.3 Visualization Testing
- [ ] Visual regression tests
- [ ] Test various tree depths
- [ ] Test long sentences
- [ ] Verify accessibility (alt text for diagram)

## Phase 4: Web Application

### 4.1 UI Framework Decision
- [ ] Evaluate: vanilla TS, Lit, Preact
- [ ] Choose based on: bundle size, simplicity, reactivity needs
- [ ] Document decision in MEMORY.md

### 4.2 Sentence Builder Component
- [ ] Word block component with POS selector
- [ ] "IDK" wildcard block
- [ ] Drag-and-drop or click-to-add interface
- [ ] Real-time validation feedback

### 4.3 Parse Display
- [ ] Show all valid parses (tabs or carousel)
- [ ] Embed visualization component
- [ ] Parse count indicator
- [ ] "No valid parse" error state

### 4.4 Main App Shell
- [ ] Simple layout: builder → visualizer → interpreter
- [ ] Mobile-responsive design
- [ ] Minimal styling (CSS custom properties)

## Phase 5: LLM Integration

### 5.1 API Design
- [ ] Define request format: sentence + parse tree + POS tags
- [ ] Define response format: interpretation string
- [ ] Handle API errors gracefully

### 5.2 Integration
- [ ] Implement API client (fetch-based)
- [ ] Add loading state during inference
- [ ] Display interpretation below diagram
- [ ] Cache responses to avoid duplicate calls

### 5.3 Prompt Engineering
- [ ] Design prompt that explains the parse structure
- [ ] Include POS annotations in context
- [ ] Request natural English interpretation
- [ ] Test with various Buffalo sentence parses

## Phase 6: Polish

### 6.1 Error Handling
- [ ] Input validation throughout
- [ ] User-friendly error messages
- [ ] Fallback states for all components

### 6.2 Performance
- [ ] Lazy load visualization
- [ ] Debounce parse on input
- [ ] Optimize for 8-word Buffalo sentences

### 6.3 Documentation
- [ ] Update README with usage instructions
- [ ] Add inline code comments where non-obvious
- [ ] Create example sentences gallery

---

## Current Status

**Phase**: Not started
**Next Step**: Phase 1.1 - Project Setup
