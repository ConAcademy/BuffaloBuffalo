import { describe, it, expect } from 'vitest';
import { Lexicon, createTestLexicon, createBuffaloLexicon } from './lexicon.js';

describe('Lexicon', () => {
  it('should add and lookup words', () => {
    const lex = new Lexicon();
    lex.addWord('dog', 'N');

    const entries = lex.lookup('dog');
    expect(entries).toHaveLength(1);
    expect(entries[0]!.pos).toBe('N');
  });

  it('should support multiple POS for same word', () => {
    const lex = new Lexicon();
    lex.addWord('run', 'N'); // "a run"
    lex.addWord('run', 'V'); // "to run"

    const entries = lex.lookup('run');
    expect(entries).toHaveLength(2);
    expect(entries.map(e => e.pos).sort()).toEqual(['N', 'V']);
  });

  it('should be case-insensitive for lookup', () => {
    const lex = new Lexicon();
    lex.addWord('Dog', 'N');

    expect(lex.lookup('dog')).toHaveLength(1);
    expect(lex.lookup('DOG')).toHaveLength(1);
    expect(lex.lookup('Dog')).toHaveLength(1);
  });

  it('should return empty array for unknown words', () => {
    const lex = new Lexicon();
    expect(lex.lookup('unknown')).toEqual([]);
  });

  it('should track features', () => {
    const lex = new Lexicon();
    lex.addWord('dogs', 'N', { number: 'plural' });

    const entries = lex.lookup('dogs');
    expect(entries[0]!.features?.number).toBe('plural');
  });

  it('should report correct size', () => {
    const lex = new Lexicon();
    lex.addWord('run', 'N');
    lex.addWord('run', 'V');
    lex.addWord('dog', 'N');

    expect(lex.size).toBe(3);
  });
});

describe('createTestLexicon', () => {
  it('should contain common English words', () => {
    const lex = createTestLexicon();

    expect(lex.has('the')).toBe(true);
    expect(lex.has('dog')).toBe(true);
    expect(lex.has('chased')).toBe(true);
    expect(lex.has('who')).toBe(true);
  });

  it('should have correct POS for words', () => {
    const lex = createTestLexicon();

    expect(lex.lookup('the')[0]!.pos).toBe('DET');
    expect(lex.lookup('dog')[0]!.pos).toBe('N');
    expect(lex.lookup('chased')[0]!.pos).toBe('V');
  });

  it('should NOT contain buffalo', () => {
    const lex = createTestLexicon();
    expect(lex.has('buffalo')).toBe(false);
  });
});

describe('createBuffaloLexicon', () => {
  it('should contain buffalo with multiple POS', () => {
    const lex = createBuffaloLexicon();

    const entries = lex.lookup('buffalo');
    expect(entries.length).toBeGreaterThan(1);

    const posSet = new Set(entries.map(e => e.pos));
    expect(posSet.has('N')).toBe(true);  // noun (animal)
    expect(posSet.has('V')).toBe(true);  // verb (intimidate)
  });

  it('should contain Buffalo as proper noun', () => {
    const lex = createBuffaloLexicon();

    // Lookup is case-insensitive, so "Buffalo" and "buffalo" return same results
    const entries = lex.lookup('Buffalo');
    const properNoun = entries.find(e => e.pos === 'PN');
    expect(properNoun).toBeDefined();
  });
});
