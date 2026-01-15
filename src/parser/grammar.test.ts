import { describe, it, expect } from 'vitest';
import { Grammar, createEnglishGrammar, isTerminal, isNonTerminal } from './grammar.js';

describe('Grammar', () => {
  it('should add and retrieve rules', () => {
    const g = new Grammar();
    g.addRule('S', ['NP', 'VP']);

    const rules = g.getRulesFor('S');
    expect(rules).toHaveLength(1);
    expect(rules[0]!.rhs).toEqual(['NP', 'VP']);
  });

  it('should support multiple rules for same LHS', () => {
    const g = new Grammar();
    g.addRule('NP', ['DET', 'N']);
    g.addRule('NP', ['N']);

    const rules = g.getRulesFor('NP');
    expect(rules).toHaveLength(2);
  });

  it('should track probability', () => {
    const g = new Grammar();
    g.addRule('S', ['NP', 'VP'], 0.8);

    const rules = g.getRulesFor('S');
    expect(rules[0]!.probability).toBe(0.8);
  });

  it('should have S as start symbol', () => {
    const g = new Grammar();
    expect(g.startSymbol).toBe('S');
  });
});

describe('createEnglishGrammar', () => {
  it('should have S rules', () => {
    const g = createEnglishGrammar();
    const sRules = g.getRulesFor('S');
    expect(sRules.length).toBeGreaterThan(0);
  });

  it('should have NP rules', () => {
    const g = createEnglishGrammar();
    const npRules = g.getRulesFor('NP');
    expect(npRules.length).toBeGreaterThan(0);
  });

  it('should have VP rules', () => {
    const g = createEnglishGrammar();
    const vpRules = g.getRulesFor('VP');
    expect(vpRules.length).toBeGreaterThan(0);
  });

  it('should have RC (relative clause) rules', () => {
    const g = createEnglishGrammar();
    const rcRules = g.getRulesFor('RC');
    expect(rcRules.length).toBeGreaterThan(0);
  });

  it('should support reduced relative clauses', () => {
    const g = createEnglishGrammar();
    const rcRules = g.getRulesFor('RC');
    // RC → NP VP is the reduced relative clause rule
    const reducedRC = rcRules.find(r =>
      r.rhs.length === 2 && r.rhs[0] === 'NP' && r.rhs[1] === 'VP'
    );
    expect(reducedRC).toBeDefined();
  });
});

describe('isTerminal / isNonTerminal', () => {
  it('should identify terminals', () => {
    expect(isTerminal('N')).toBe(true);
    expect(isTerminal('V')).toBe(true);
    expect(isTerminal('DET')).toBe(true);
    expect(isTerminal('ADJ')).toBe(true);
  });

  it('should identify non-terminals', () => {
    expect(isNonTerminal('S')).toBe(true);
    expect(isNonTerminal('NP')).toBe(true);
    expect(isNonTerminal('VP')).toBe(true);
    expect(isNonTerminal('RC')).toBe(true);
  });

  it('should distinguish terminals from non-terminals', () => {
    expect(isTerminal('S')).toBe(false);
    expect(isNonTerminal('N')).toBe(false);
  });
});
