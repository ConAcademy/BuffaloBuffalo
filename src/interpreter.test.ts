import { describe, it, expect } from 'vitest';
import { interpretTree } from './interpreter.js';
import { EarleyParser } from './parser/earley.js';
import { createEnglishGrammar } from './parser/grammar.js';
import { createBuffaloLexicon } from './parser/lexicon.js';
import type { ParseNode } from './types.js';

// Helper to check if a tree contains a verb
function treeContainsVerb(node: ParseNode): boolean {
  if (node.symbol === 'V') return true;
  return node.children.some(c => treeContainsVerb(c));
}

describe('interpretTree', () => {
  const grammar = createEnglishGrammar();
  const lexicon = createBuffaloLexicon();
  const parser = new EarleyParser(grammar, lexicon);

  it('interprets a simple NP VP sentence (PN N V)', () => {
    // "Buffalo buffalo buffalo" = Bison from Buffalo intimidate
    const result = parser.parse(['Buffalo', 'buffalo', 'buffalo']);
    expect(result.trees.length).toBeGreaterThan(0);

    // Find a parse that contains a verb
    const verbTree = result.trees.find(t => treeContainsVerb(t.root));
    expect(verbTree).toBeDefined();

    const interpretation = interpretTree(verbTree!);
    expect(interpretation.toLowerCase()).toContain('bison');
    expect(interpretation.toLowerCase()).toContain('intimidate');
  });

  it('interprets a 4-word sentence', () => {
    // "Buffalo buffalo buffalo buffalo"
    const result = parser.parse(['Buffalo', 'buffalo', 'buffalo', 'buffalo']);
    expect(result.trees.length).toBeGreaterThan(0);

    const interpretation = interpretTree(result.trees[0]);
    expect(interpretation).toBeTruthy();
    expect(interpretation.endsWith('.')).toBe(true);
  });

  it('interprets the famous 8-word sentence', () => {
    // "Buffalo buffalo Buffalo buffalo buffalo buffalo Buffalo buffalo"
    const sentence = ['Buffalo', 'buffalo', 'Buffalo', 'buffalo', 'buffalo', 'buffalo', 'Buffalo', 'buffalo'];
    const result = parser.parse(sentence);
    expect(result.trees.length).toBeGreaterThan(0);

    // Find a parse that contains a verb
    const verbTree = result.trees.find(t => treeContainsVerb(t.root));
    expect(verbTree).toBeDefined();

    const interpretation = interpretTree(verbTree!);
    expect(interpretation.toLowerCase()).toContain('bison');
    expect(interpretation.toLowerCase()).toContain('intimidate');
    // Should be a meaningful sentence
    expect(interpretation.length).toBeGreaterThan(20);
  });

  it('interprets a single verb (imperative)', () => {
    // "buffalo" as imperative = Intimidate!
    const result = parser.parse(['buffalo']);
    // Should have at least one parse (could be N, V, etc.)
    const vpParse = result.trees.find(t => {
      const firstChild = t.root.children[0];
      return firstChild?.symbol === 'VP' || firstChild?.symbol === 'V';
    });
    if (vpParse) {
      const interpretation = interpretTree(vpParse);
      expect(interpretation.toLowerCase()).toContain('intimidate');
    }
  });

  it('capitalizes first letter and ends with period', () => {
    const result = parser.parse(['Buffalo', 'buffalo', 'buffalo']);
    expect(result.trees.length).toBeGreaterThan(0);

    const interpretation = interpretTree(result.trees[0]);
    expect(interpretation[0]).toMatch(/[A-Z]/);
    expect(interpretation.endsWith('.')).toBe(true);
  });

  it('handles relative clauses', () => {
    // 5-word: "Buffalo buffalo buffalo Buffalo buffalo"
    // = Bison from Buffalo [that] bison from Buffalo intimidate
    const result = parser.parse(['Buffalo', 'buffalo', 'buffalo', 'Buffalo', 'buffalo']);
    expect(result.trees.length).toBeGreaterThan(0);

    // At least one interpretation should have "that" for relative clause
    const interpretations = result.trees.map(t => interpretTree(t));
    const hasRelativeClause = interpretations.some(i => i.includes('that'));
    expect(hasRelativeClause).toBe(true);
  });
});
