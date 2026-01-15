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
- [x] NP → (DET) (ADJ)* N (PP)* (relative clause)
- [x] VP → V (NP) (PP)*
- [x] Relative clause → (that/which) S | reduced relative
- [x] Handle reduced relative clauses (critical for Buffalo sentences)

### 2.3 Parser Implementation ✓
- [x] Implement Earley parser for ambiguous grammars
- [x] Return all valid parse trees (not just first match)
- [x] Add probability scoring for ranking parses
- [x] Handle unknown words gracefully (returns empty parse)

### 2.4 Parser Testing ✓
- [x] Write unit tests with non-Buffalo sentences
- [x] Test: "The dog chased the cat"
- [x] Test: "The man who the dog bit ran away"
- [x] Test ambiguous sentences with multiple valid parses
- [x] Verify all expected parses are returned

### 2.5 Buffalo Dictionary ✓
- [x] Create Buffalo-only lexicon
- [x] `Buffalo` → PN (proper noun, city)
- [x] `buffalo` → N (noun, animal)
- [x] `buffalo` → V (verb, to intimidate)
- [x] Test with known Buffalo sentence parses (8-word sentence parses)

## Phase 3: Visualization ✓

### 3.1 Diagram Generator ✓
- [x] Design SVG-based tree diagram renderer
- [x] Two layout styles: tree view and Reed-Kellogg
- [x] Curved connector lines between nodes
- [x] Color-coded nodes (phrases vs terminals)

### 3.2 Render Implementation ✓
- [x] `renderTreeToSVG(parseTree): string`
- [x] `renderTreeToElement(parseTree): SVGElement`
- [x] `renderTreeGallery(trees): string`
- [x] Calculate layout dimensions dynamically

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
- [x] Color-coded blocks (purple=city, green=animal, red=verb)
- [x] Click-to-add interface
- [x] Click-to-remove words
- [x] Preset buttons (3, 4, 5, 8 words)

### 4.3 Parse Display ✓
- [x] Show all valid parses (prev/next navigation)
- [x] Embed SVG visualization
- [x] Parse count indicator
- [x] "No valid parse" error state
- [x] Style toggle (tree vs Reed-Kellogg)

### 4.4 Main App Shell ✓
- [x] Simple layout: builder → visualizer
- [x] Responsive design
- [x] Clean styling with CSS custom properties

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

**Phase**: Phase 4 Complete
**Next Step**: Phase 5 - LLM Integration (optional)
