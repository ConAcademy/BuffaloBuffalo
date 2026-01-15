# MEMORY.md - Long-Term Working Concepts

This file stores persistent concepts, decisions, and insights for the BuffaloBuffalo project.

## Linguistic Foundation

### Buffalo Parts of Speech (Validated)
| Word | Part of Speech | Meaning | Valid? |
|------|---------------|---------|--------|
| Buffalo | Proper Noun (PN) | The city in New York | Yes |
| buffalo | Noun (N) | The animal (bison) | Yes |
| buffalo | Verb (V) | To intimidate, bully, or bewilder | Yes |
| buffalo | Adverb | N/A | **No** - not a real usage |
| buffalo | Conjunction | N/A | **No** - not a real usage |

**Note:** Proper noun uses `PN` (not `NP`) to avoid collision with `NP` non-terminal (Noun Phrase).

### Grammar Rules for Buffalo Sentences
- Proper noun "Buffalo" acts as an adjective modifying "buffalo" (noun)
- "Buffalo buffalo" = bison from Buffalo, NY
- Relative clauses can be reduced: "buffalo [that] Buffalo buffalo buffalo" = bison [that] Buffalo bison intimidate
- Verb agreement: "buffalo" (verb) works for plural subjects
- Imperative: "Buffalo!" = "Intimidate!" (S → VP rule)
- Exclamatory: "Buffalo!" as noun exclamation (S → NP rule)

### Example Parse
"Buffalo buffalo Buffalo buffalo buffalo buffalo Buffalo buffalo"
1. [Buffalo buffalo] - Subject: bison from Buffalo
2. [Buffalo buffalo buffalo] - Relative clause: that Buffalo bison intimidate
3. [buffalo] - Main verb: intimidate
4. [Buffalo buffalo] - Object: Buffalo bison

## Technical Decisions

### Parser Architecture (Implemented)
- **Earley parser** chosen over CYK for flexibility with arbitrary CFG rules
- Dictionary-driven: `Grammar` class + `Lexicon` class
- Handles reduced relative clauses via `RC → NP VP` rule
- Returns all valid parse trees (capped at 100 to prevent explosion)
- Edge-based chart structure for tree reconstruction
- **Tree deduplication**: Identical parse trees are filtered out via serialization

### Symbol Naming Convention
- **Terminals (POS tags):** N, V, PN, DET, ADJ, ADV, PREP, CONJ, REL, AUX
- **Non-terminals:** S, NP, VP, PP, ADJP, ADVP, RC
- `isTerminal()` function distinguishes them

### Visualization (Implemented)
- SVG-based tree diagrams
- Two layout styles: Tree view (top-down) and Reed-Kellogg (baseline)
- Color-coded by POS: Purple (PN), Green (N), Red (V)
- Position badges (1-indexed) in upper-right of terminal nodes
- Golden Buffalo wildcard: star badge in upper-left corner
- Curved Bezier connector lines between parent/child nodes

### Web Application Features (Implemented)
- **Two Modes**:
  - **Grammar Mode**: Constrained POS selection, defaults to A-N-V pattern, presets available
  - **Wild Mode**: All buffalos are wildcards (brown), explores all possible parses
- Mode switching clears sentence: Wild starts with 1 buffalo, Grammar starts with A-N-V
- **Auto-parsing**: Tree updates instantly on any change (no Parse button)
- **Loading spinner**: Visual feedback during complex parses
- **Performance warning**: Alert when Wild Mode exceeds 5 buffalos (exponential complexity)
- **Golden Buffalo wildcard** (Grammar Mode only): Expands to try all 3 valid POS, limited to one per sentence
- **Drag-and-drop**:
  - Reorder words by dragging within sentence bar
  - Drag POS buttons directly into sentence bar at specific position
  - Drag words off sentence bar to remove (with poof animation)
- **Hover X button**: Click to remove words
- **Invalid parse state**: Red dashed box with helpful message
- **Mobile responsive**: Smaller header/images on mobile, proper touch handling

### Type Structure (Implemented)
```typescript
type PartOfSpeech = 'N' | 'V' | 'PN' | 'DET' | 'ADJ' | 'ADV' | 'PREP' | 'CONJ' | 'REL' | 'AUX';
type NonTerminal = 'S' | 'NP' | 'VP' | 'PP' | 'ADJP' | 'ADVP' | 'RC';

interface LexiconEntry {
  word: string;
  pos: PartOfSpeech;
  lemma?: string;
  features?: GrammaticalFeatures;
}
```

### Interpretation Engine (Implemented)
- Rule-based tree-to-English converter (`src/interpreter.ts`)
- Recursive traversal of parse tree
- Translation rules:
  - PN (Buffalo) → "from Buffalo" when modifying, standalone otherwise
  - N (buffalo) → "bison"
  - V (buffalo) → "intimidate"
- Relative clause insertion with "that"
- Color-coded HTML output matching visualization colors
- Superscript position numbers linking to tree nodes

## Resolved Decisions

### UI Framework: Vanilla TypeScript
- **Decision:** No framework, pure vanilla TypeScript + HTML
- **Rationale:**
  - Zero runtime dependencies
  - Vite handles ES module bundling
  - Simple enough app doesn't need reactivity framework
  - Smallest possible bundle size

### Linguistic Purity
- **Decision:** Only include linguistically valid POS for "buffalo"
- **Rationale:** Verified with external sources that "buffalo" is only ever noun, proper noun, or verb
- **Removed:** Adverb and Conjunction buttons (were added then removed)

### Two Mode Design
- **Decision:** Grammar Mode (constrained) + Wild Mode (exploration)
- **Rationale:**
  - Grammar Mode allows precise control over sentence construction
  - Wild Mode satisfies curiosity about all possible parses
  - Mode switching clears sentence to prevent accidental long computations
  - Grammar Mode defaults to A-N-V (simplest valid sentence) for quick start
  - Wild Mode defaults to single buffalo for safety

## Open Questions
- [ ] LLM API choice for interpretation feature
- [ ] Should we support other homophone sentences beyond Buffalo?

## References
- [Wikipedia: Buffalo buffalo](https://en.wikipedia.org/wiki/Buffalo_buffalo_Buffalo_buffalo_buffalo_buffalo_Buffalo_buffalo)
- Steven Pinker's "The Language Instinct"
- Reed-Kellogg sentence diagramming
