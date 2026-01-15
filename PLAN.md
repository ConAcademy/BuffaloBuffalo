# PLAN.md - Implementation Plan

## Phase 1: Foundation ✓

### 1.1 Project Setup ✓
- [x] Initialize TypeScript project with strict mode
- [x] Configure build tooling (Vite)
- [x] Set up test framework (Vitest)
- [x] Create folder structure: `src/parser`, `src/viz`, `src/web`, `src/llm`

### 1.2 Type Definitions ✓
- [x] Define `PartOfSpeech` type (union type)
- [x] Define `LexiconEntry` interface
- [x] Define `ParseTree` and `ParseNode` types
- [x] Define `GrammarRule` type for CFG rules
- [x] Define `NonTerminal` and `GrammarSymbol` types
- [x] Define `GrammaticalFeatures` for agreement

## Phase 2: Parse Tree Generator ✓

### 2.1 Lexicon System ✓
- [x] Create `Lexicon` class with word lookup
- [x] Implement `addWord(word, pos, features?)` method
- [x] Implement `lookup(word): LexiconEntry[]` returning all POS options
- [x] Create test lexicon with common English words (not Buffalo)

### 2.2 Grammar Rules ✓
- [x] Define CFG rules for English sentence structure
- [x] S → NP VP (basic sentence)
- [x] S → VP (imperative sentences)
- [x] S → NP (exclamatory sentences)
- [x] NP → (DET) (ADJ)* N (PP)* (relative clause)
- [x] VP → V (NP) (PP)*
- [x] Relative clause → (that/which) S | reduced relative
- [x] Handle reduced relative clauses (critical for Buffalo sentences)
- [x] Compound sentence rules (S → S CONJ S, etc.)

### 2.3 Parser Implementation ✓
- [x] Implement Earley parser for ambiguous grammars
- [x] Return all valid parse trees (not just first match)
- [x] Add probability scoring for ranking parses
- [x] Handle unknown words gracefully (returns empty parse)
- [x] Deduplicate identical parse trees

### 2.4 Parser Testing ✓
- [x] Write unit tests with non-Buffalo sentences
- [x] Test: "The dog chased the cat"
- [x] Test: "The man who the dog bit ran away"
- [x] Test ambiguous sentences with multiple valid parses
- [x] Verify all expected parses are returned
- [x] Test tree deduplication

### 2.5 Buffalo Dictionary ✓
- [x] Create Buffalo-only lexicon
- [x] `Buffalo` → PN (proper noun, city)
- [x] `buffalo` → N (noun, animal)
- [x] `buffalo` → V (verb, to intimidate)
- [x] Test with known Buffalo sentence parses (8-word sentence parses)
- [x] Verified: No adverb or conjunction forms (linguistically invalid)

## Phase 3: Visualization ✓

### 3.1 Diagram Generator ✓
- [x] Design SVG-based tree diagram renderer
- [x] Two layout styles: tree view and Reed-Kellogg
- [x] Curved connector lines between nodes
- [x] Color-coded nodes by POS (purple=PN, green=N, red=V)
- [x] Position badges (1-indexed) for terminal nodes
- [x] Golden Buffalo wildcard indicator (star badge)

### 3.2 Render Implementation ✓
- [x] `renderTreeToSVG(parseTree, config): string`
- [x] `renderTreeToElement(parseTree): SVGElement`
- [x] `renderTreeGallery(trees): string`
- [x] Calculate layout dimensions dynamically
- [x] Support wildcardPosition in config

### 3.3 Visualization Testing ✓
- [x] 11 visualization tests passing
- [x] Test various tree depths
- [x] Test Buffalo sentences
- [x] Test empty/no-parse cases

## Phase 4: Web Application ✓

### 4.1 UI Framework Decision ✓
- [x] Chose: **Vanilla TypeScript** (zero dependencies!)
- [x] Rationale: simplest, smallest bundle, Vite handles ES modules
- [x] Documented in MEMORY.md

### 4.2 Sentence Builder Component ✓
- [x] Word block component with POS selector (3 buttons)
- [x] Color-coded blocks (purple=adjective, green=noun, red=verb)
- [x] Click-to-add interface
- [x] Golden Buffalo wildcard button (limited to one per sentence)
- [x] Clear button
- [x] Preset buttons (3, 4, 5, 8 words)

### 4.3 Drag-and-Drop Features ✓
- [x] Drag words to reorder within sentence bar
- [x] Drag POS buttons directly into sentence bar at position
- [x] Visual drop indicator showing insert position
- [x] Drag words off sentence bar to remove
- [x] Poof animation and emoji on removal
- [x] Hover X button for quick removal

### 4.4 Parse Display ✓
- [x] Auto-parsing on any change (no Parse button)
- [x] Show all valid parses (prev/next navigation)
- [x] Embed SVG visualization
- [x] Parse count indicator
- [x] "No valid parse" error state (red dashed box)
- [x] Style toggle (tree vs Reed-Kellogg)

### 4.5 Main App Shell ✓
- [x] Simple layout: builder → visualizer
- [x] Responsive design
- [x] Clean styling with CSS custom properties
- [x] Legend showing color meanings

## Phase 5: LLM Integration (Future)

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

## Phase 6: Polish (Future)

### 6.1 Error Handling
- [x] Input validation throughout
- [x] User-friendly error messages
- [x] Fallback states for all components

### 6.2 Performance
- [x] Auto-parse is fast enough (no debounce needed)
- [x] Efficient tree deduplication
- [ ] Lazy load visualization (not needed - fast enough)

### 6.3 Documentation
- [x] README with usage instructions
- [x] AGENTS.md with component overview
- [x] MEMORY.md with technical decisions
- [x] PLAN.md tracking implementation
- [ ] Inline code comments where non-obvious

---

## Current Status

**Phase**: Phase 4 Complete (Web Application)
**Tests**: 52 passing
**Next Step**: Phase 5 - LLM Integration (optional feature)
