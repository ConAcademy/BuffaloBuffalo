# MEMORY.md - Long-Term Working Concepts

This file stores persistent concepts, decisions, and insights for the BuffaloBuffalo project.

## Linguistic Foundation

### Buffalo Parts of Speech
| Word | Part of Speech | Meaning |
|------|---------------|---------|
| Buffalo | Proper Noun (PN) | The city in New York |
| buffalo | Noun (N) | The animal (bison) |
| buffalo | Verb (V) | To intimidate, bully, or bewilder |

**Note:** Proper noun uses `PN` (not `NP`) to avoid collision with `NP` non-terminal (Noun Phrase).

### Grammar Rules for Buffalo Sentences
- Proper noun "Buffalo" acts as an adjective modifying "buffalo" (noun)
- "Buffalo buffalo" = bison from Buffalo, NY
- Relative clauses can be reduced: "buffalo [that] Buffalo buffalo buffalo" = bison [that] Buffalo bison intimidate
- Verb agreement: "buffalo" (verb) works for plural subjects

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

### Symbol Naming Convention
- **Terminals (POS tags):** N, V, PN, DET, ADJ, ADV, PREP, CONJ, REL, AUX
- **Non-terminals:** S, NP, VP, PP, ADJP, ADVP, RC
- `isTerminal()` function distinguishes them

### Visualization Approach (Planned)
- Reed-Kellogg sentence diagrams (elementary school style)
- Horizontal baseline for subject-verb-object
- Diagonal lines for modifiers
- Pedestals for relative clauses

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

## Open Questions
- [ ] Which lightweight framework to use? (Candidates: vanilla, Lit, Preact)
- [ ] LLM API choice for interpretation feature
- [ ] Should we support other homophone sentences beyond Buffalo?

## References
- [Wikipedia: Buffalo buffalo](https://en.wikipedia.org/wiki/Buffalo_buffalo_Buffalo_buffalo_buffalo_buffalo_Buffalo_buffalo)
- Steven Pinker's "The Language Instinct"
- Reed-Kellogg sentence diagramming
