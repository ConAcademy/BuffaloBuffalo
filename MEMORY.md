# MEMORY.md - Long-Term Working Concepts

This file stores persistent concepts, decisions, and insights for the BuffaloBuffalo project.

## Linguistic Foundation

### Buffalo Parts of Speech
| Word | Part of Speech | Meaning |
|------|---------------|---------|
| Buffalo | Proper Noun (NP) | The city in New York |
| buffalo | Noun (N) | The animal (bison) |
| buffalo | Verb (V) | To intimidate, bully, or bewilder |

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

### Parser Architecture
- Chart parsing or CYK algorithm for handling ambiguous grammars
- Dictionary-driven: grammar rules + lexicon
- Must handle reduced relative clauses (omitted "that/which")

### Visualization Approach
- Reed-Kellogg sentence diagrams (elementary school style)
- Horizontal baseline for subject-verb-object
- Diagonal lines for modifiers
- Pedestals for relative clauses

### Dictionary Structure
```typescript
interface LexiconEntry {
  word: string;
  pos: PartOfSpeech;
  features?: Record<string, string>;
}

type PartOfSpeech = 'N' | 'V' | 'NP' | 'DET' | 'ADJ' | 'ADV' | 'PREP' | 'CONJ' | 'REL';
```

## Open Questions
- [ ] Which lightweight framework to use? (Candidates: vanilla, Lit, Preact)
- [ ] LLM API choice for interpretation feature
- [ ] Should we support other homophone sentences beyond Buffalo?

## References
- [Wikipedia: Buffalo buffalo](https://en.wikipedia.org/wiki/Buffalo_buffalo_Buffalo_buffalo_buffalo_buffalo_Buffalo_buffalo)
- Steven Pinker's "The Language Instinct"
- Reed-Kellogg sentence diagramming
