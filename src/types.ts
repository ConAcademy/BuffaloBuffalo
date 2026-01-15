/**
 * Core type definitions for BuffaloBuffalo parser
 */

/** Parts of speech supported by the parser */
export type PartOfSpeech =
  | 'N'      // Noun
  | 'V'      // Verb
  | 'NP'     // Proper Noun
  | 'DET'    // Determiner (the, a, an)
  | 'ADJ'    // Adjective
  | 'ADV'    // Adverb
  | 'PREP'   // Preposition
  | 'CONJ'   // Conjunction
  | 'REL'    // Relative pronoun (that, which, who)
  | 'AUX';   // Auxiliary verb

/** Grammatical features for agreement and inflection */
export interface GrammaticalFeatures {
  number?: 'singular' | 'plural';
  person?: 1 | 2 | 3;
  tense?: 'present' | 'past' | 'future';
  case?: 'nominative' | 'accusative' | 'genitive';
}

/** A word entry in the lexicon */
export interface LexiconEntry {
  word: string;
  pos: PartOfSpeech;
  lemma?: string;
  features?: GrammaticalFeatures;
}

/** Non-terminal symbols in the grammar */
export type NonTerminal =
  | 'S'      // Sentence
  | 'NP'     // Noun Phrase
  | 'VP'     // Verb Phrase
  | 'PP'     // Prepositional Phrase
  | 'ADJP'   // Adjective Phrase
  | 'ADVP'   // Adverb Phrase
  | 'RC';    // Relative Clause

/** A symbol in the grammar (terminal or non-terminal) */
export type GrammarSymbol = PartOfSpeech | NonTerminal;

/** A context-free grammar rule */
export interface GrammarRule {
  lhs: NonTerminal;
  rhs: GrammarSymbol[];
  probability?: number;
}

/** A node in the parse tree */
export interface ParseNode {
  symbol: GrammarSymbol;
  children: ParseNode[];
  /** For terminal nodes, the actual word */
  word?: string;
  /** For terminal nodes, the lexicon entry */
  entry?: LexiconEntry;
  /** Span in the original sentence [start, end) */
  span: [number, number];
}

/** A complete parse tree */
export interface ParseTree {
  root: ParseNode;
  sentence: string[];
  probability?: number;
}

/** Result of parsing - may have multiple valid trees */
export interface ParseResult {
  input: string[];
  trees: ParseTree[];
  errors?: string[];
}
