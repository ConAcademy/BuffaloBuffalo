import { describe, it, expect } from 'vitest';
import type { LexiconEntry, ParseNode, GrammarRule } from './types.js';

describe('Type definitions', () => {
  it('should allow creating a LexiconEntry', () => {
    const entry: LexiconEntry = {
      word: 'buffalo',
      pos: 'N',
      features: { number: 'plural' },
    };
    expect(entry.word).toBe('buffalo');
    expect(entry.pos).toBe('N');
  });

  it('should allow creating a ParseNode', () => {
    const node: ParseNode = {
      symbol: 'N',
      children: [],
      word: 'buffalo',
      span: [0, 1],
    };
    expect(node.symbol).toBe('N');
    expect(node.span).toEqual([0, 1]);
  });

  it('should allow creating a GrammarRule', () => {
    const rule: GrammarRule = {
      lhs: 'S',
      rhs: ['NP', 'VP'],
      probability: 1.0,
    };
    expect(rule.lhs).toBe('S');
    expect(rule.rhs).toHaveLength(2);
  });
});
