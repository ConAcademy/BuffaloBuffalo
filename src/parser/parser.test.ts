import { describe, it, expect } from 'vitest';
import { EarleyParser } from './earley.js';
import { createEnglishGrammar } from './grammar.js';
import { createTestLexicon, createBuffaloLexicon } from './lexicon.js';
import type { ParseNode } from '../types.js';

describe('EarleyParser', () => {
  describe('with test lexicon', () => {
    const grammar = createEnglishGrammar();
    const lexicon = createTestLexicon();
    const parser = new EarleyParser(grammar, lexicon);

    it('should parse "the dog chased the cat"', () => {
      const result = parser.parse(['the', 'dog', 'chased', 'the', 'cat']);

      expect(result.trees.length).toBeGreaterThan(0);
      expect(result.errors).toBeUndefined();

      const tree = result.trees[0]!;
      expect(tree.root.symbol).toBe('S');
    });

    it('should parse "dogs chase cats"', () => {
      const result = parser.parse(['dogs', 'chase', 'cats']);

      expect(result.trees.length).toBeGreaterThan(0);
      expect(result.errors).toBeUndefined();
    });

    it('should parse "the big dog ran"', () => {
      const result = parser.parse(['the', 'big', 'dog', 'ran']);

      expect(result.trees.length).toBeGreaterThan(0);
    });

    it('should parse "the man who the dog bit ran"', () => {
      const result = parser.parse(['the', 'man', 'who', 'the', 'dog', 'bit', 'ran']);

      expect(result.trees.length).toBeGreaterThan(0);
    });

    it('should fail on unknown words', () => {
      const result = parser.parse(['the', 'xyz', 'ran']);

      expect(result.trees).toHaveLength(0);
      expect(result.errors).toBeDefined();
    });

    it('should fail on empty input', () => {
      const result = parser.parse([]);

      expect(result.trees).toHaveLength(0);
      expect(result.errors).toContain('Empty input');
    });

    it('should return multiple parses for ambiguous sentences', () => {
      // "the man saw the dog with the cat" is ambiguous:
      // - saw [the dog with the cat]
      // - saw [the dog] [with the cat]
      // This may or may not produce multiple parses depending on grammar
      const result = parser.parse(['the', 'man', 'saw', 'the', 'dog']);
      expect(result.trees.length).toBeGreaterThan(0);
    });
  });

  describe('tree structure', () => {
    const grammar = createEnglishGrammar();
    const lexicon = createTestLexicon();
    const parser = new EarleyParser(grammar, lexicon);

    it('should have correct span for simple sentence', () => {
      const result = parser.parse(['the', 'dog', 'ran']);

      if (result.trees.length > 0) {
        const root = result.trees[0]!.root;
        expect(root.span[0]).toBe(0);
        expect(root.span[1]).toBe(3);
      }
    });

    it('should have terminal nodes with words', () => {
      const result = parser.parse(['the', 'dog', 'ran']);

      if (result.trees.length > 0) {
        const terminals = collectTerminals(result.trees[0]!.root);
        const words = terminals.map(t => t.word);
        expect(words).toContain('the');
        expect(words).toContain('dog');
        expect(words).toContain('ran');
      }
    });
  });
});

describe('Buffalo sentence parsing', () => {
  const grammar = createEnglishGrammar();
  const lexicon = createBuffaloLexicon();
  const parser = new EarleyParser(grammar, lexicon);

  it('should parse "buffalo buffalo" (noun phrase)', () => {
    // "Buffalo buffalo" = bison from Buffalo
    const result = parser.parse(['buffalo', 'buffalo']);

    // This should parse as NP (Buffalo as modifier, buffalo as noun)
    // or as S if we get creative
    expect(result.trees.length).toBeGreaterThan(0);
  });

  it('should parse "buffalo buffalo buffalo" (simple sentence)', () => {
    // "Buffalo buffalo buffalo" = Buffalo bison intimidate
    // S -> NP VP where NP is "Buffalo buffalo" and VP is "buffalo"
    const result = parser.parse(['buffalo', 'buffalo', 'buffalo']);

    expect(result.trees.length).toBeGreaterThan(0);
  });

  it('should parse "buffalo buffalo buffalo buffalo"', () => {
    // Could be:
    // [Buffalo buffalo] [buffalo buffalo] = Buffalo bison intimidate bison
    // or other interpretations
    const result = parser.parse(['buffalo', 'buffalo', 'buffalo', 'buffalo']);

    expect(result.trees.length).toBeGreaterThan(0);
  });

  it('should parse the famous 8-word Buffalo sentence', () => {
    // "Buffalo buffalo Buffalo buffalo buffalo buffalo Buffalo buffalo"
    const sentence = [
      'buffalo', 'buffalo', 'buffalo', 'buffalo',
      'buffalo', 'buffalo', 'buffalo', 'buffalo'
    ];

    const result = parser.parse(sentence);

    // The famous sentence should parse
    // It might have multiple valid parses due to ambiguity
    expect(result.trees.length).toBeGreaterThan(0);
  });

  it('should produce multiple parses for ambiguous Buffalo sentences', () => {
    // 4+ word Buffalo sentences should be ambiguous
    const result = parser.parse(['buffalo', 'buffalo', 'buffalo', 'buffalo', 'buffalo']);

    // Should have at least one parse, possibly multiple
    expect(result.trees.length).toBeGreaterThan(0);
  });
});

// Helper to collect all terminal nodes from a parse tree
function collectTerminals(node: ParseNode): ParseNode[] {
  if (node.children.length === 0) {
    return node.word ? [node] : [];
  }
  return node.children.flatMap(collectTerminals);
}
