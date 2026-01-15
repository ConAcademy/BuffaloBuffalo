import type { GrammarRule, NonTerminal, GrammarSymbol } from '../types.js';

/**
 * A context-free grammar for parsing English sentences.
 */
export class Grammar {
  private rules: GrammarRule[] = [];
  private rulesByLhs: Map<NonTerminal, GrammarRule[]> = new Map();

  /**
   * Add a grammar rule.
   */
  addRule(lhs: NonTerminal, rhs: GrammarSymbol[], probability = 1.0): this {
    const rule: GrammarRule = { lhs, rhs, probability };
    this.rules.push(rule);

    const existing = this.rulesByLhs.get(lhs) ?? [];
    existing.push(rule);
    this.rulesByLhs.set(lhs, existing);

    return this;
  }

  /**
   * Get all rules with a given left-hand side.
   */
  getRulesFor(lhs: NonTerminal): GrammarRule[] {
    return this.rulesByLhs.get(lhs) ?? [];
  }

  /**
   * Get all rules in the grammar.
   */
  getAllRules(): GrammarRule[] {
    return [...this.rules];
  }

  /**
   * Get the start symbol (always 'S' for sentence).
   */
  get startSymbol(): NonTerminal {
    return 'S';
  }
}

/**
 * Create the standard English grammar for parsing.
 * Supports:
 * - Basic sentences (S → NP VP)
 * - Noun phrases with determiners, adjectives, and modifiers
 * - Verb phrases with objects
 * - Relative clauses (both full and reduced)
 * - Prepositional phrases
 */
export function createEnglishGrammar(): Grammar {
  const g = new Grammar();

  // Sentence rules
  g.addRule('S', ['NP', 'VP'], 1.0);
  // Imperative sentences (commands): "Buffalo!" = "Intimidate!"
  g.addRule('S', ['VP'], 0.8);
  // Exclamatory/nominal sentences: "Buffalo!" (as exclamation about noun)
  g.addRule('S', ['NP'], 0.5);
  // Compound sentences: "Buffalo buffalo and buffalo buffalo"
  g.addRule('S', ['S', 'CONJ', 'S'], 0.7);

  // Noun phrase rules
  // NP → N (bare noun, especially for plurals/proper nouns)
  g.addRule('NP', ['N'], 0.6);
  // NP → DET N
  g.addRule('NP', ['DET', 'N'], 0.9);
  // NP → DET ADJ N
  g.addRule('NP', ['DET', 'ADJ', 'N'], 0.8);
  // NP → ADJ N (no determiner)
  g.addRule('NP', ['ADJ', 'N'], 0.5);
  // NP → NP PP (noun phrase with prepositional phrase)
  g.addRule('NP', ['NP', 'PP'], 0.6);
  // NP → NP RC (noun phrase with relative clause)
  g.addRule('NP', ['NP', 'RC'], 0.7);
  // NP → proper noun (PN terminal tag)
  g.addRule('NP', ['PN'], 0.8); // Proper noun becomes noun phrase
  // NP → PN N (proper noun modifying noun, e.g., "Buffalo buffalo")
  g.addRule('NP', ['PN', 'N'], 0.85);
  // Compound noun phrases: "buffalo and buffalo"
  g.addRule('NP', ['NP', 'CONJ', 'NP'], 0.6);

  // Verb phrase rules
  // VP → V (intransitive)
  g.addRule('VP', ['V'], 0.7);
  // VP → V NP (transitive)
  g.addRule('VP', ['V', 'NP'], 0.9);
  // VP → V NP PP
  g.addRule('VP', ['V', 'NP', 'PP'], 0.6);
  // VP → V PP
  g.addRule('VP', ['V', 'PP'], 0.5);
  // VP → V ADV (verb with adverb)
  g.addRule('VP', ['V', 'ADV'], 0.6);
  // VP → ADV V (adverb before verb)
  g.addRule('VP', ['ADV', 'V'], 0.5);
  // VP → V NP ADV (transitive with trailing adverb)
  g.addRule('VP', ['V', 'NP', 'ADV'], 0.5);
  // VP → ADV V NP (adverb before transitive verb)
  g.addRule('VP', ['ADV', 'V', 'NP'], 0.5);
  // Compound verb phrases: "buffalo and buffalo"
  g.addRule('VP', ['VP', 'CONJ', 'VP'], 0.6);

  // Adverb phrase rules
  g.addRule('ADVP', ['ADV'], 0.8);
  g.addRule('ADVP', ['ADV', 'ADV'], 0.4);

  // Prepositional phrase rules
  // PP → PREP NP
  g.addRule('PP', ['PREP', 'NP'], 1.0);

  // Relative clause rules
  // RC → REL S (full relative clause: "who the dog bit")
  g.addRule('RC', ['REL', 'S'], 0.8);
  // RC → REL VP (relative clause with just VP: "who ran")
  g.addRule('RC', ['REL', 'VP'], 0.7);
  // RC → NP VP (REDUCED relative clause - critical for Buffalo!)
  // "buffalo [that] Buffalo buffalo buffalo" → the "that" is omitted
  g.addRule('RC', ['NP', 'VP'], 0.6);
  // RC → S (another form of reduced relative - subject extracted)
  g.addRule('RC', ['S'], 0.4);

  return g;
}

/**
 * Check if a symbol is a terminal (POS tag) vs non-terminal.
 * Non-terminals: S, NP, VP, PP, ADJP, ADVP, RC
 * Terminals: N, V, PN, DET, ADJ, ADV, PREP, CONJ, REL, AUX
 */
export function isTerminal(symbol: GrammarSymbol): boolean {
  const nonTerminals: Set<string> = new Set(['S', 'NP', 'VP', 'PP', 'ADJP', 'ADVP', 'RC']);
  return !nonTerminals.has(symbol);
}

/**
 * Check if a symbol is a non-terminal.
 */
export function isNonTerminal(symbol: GrammarSymbol): symbol is NonTerminal {
  return !isTerminal(symbol);
}
