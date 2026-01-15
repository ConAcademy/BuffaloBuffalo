import { describe, it, expect } from 'vitest';
import { calculateLayout, calculateReedKelloggLayout } from './layout.js';
import { renderTreeToSVG, renderTreeGallery } from './renderer.js';
import { EarleyParser, createEnglishGrammar, createBuffaloLexicon, createTestLexicon } from '../parser/index.js';

describe('Layout', () => {
  const grammar = createEnglishGrammar();
  const lexicon = createTestLexicon();
  const parser = new EarleyParser(grammar, lexicon);

  it('should calculate layout for simple tree', () => {
    const result = parser.parse(['the', 'dog', 'ran']);
    expect(result.trees.length).toBeGreaterThan(0);

    const layout = calculateLayout(result.trees[0]!);
    expect(layout.root).toBeDefined();
    expect(layout.width).toBeGreaterThan(0);
    expect(layout.height).toBeGreaterThan(0);
  });

  it('should position root at top', () => {
    const result = parser.parse(['the', 'dog', 'ran']);
    const layout = calculateLayout(result.trees[0]!);

    // Root should be near the top
    expect(layout.root.y).toBeLessThan(50);
  });

  it('should position children below parent', () => {
    const result = parser.parse(['the', 'dog', 'ran']);
    const layout = calculateLayout(result.trees[0]!);

    for (const child of layout.root.children) {
      expect(child.y).toBeGreaterThan(layout.root.y);
    }
  });
});

describe('Reed-Kellogg Layout', () => {
  const grammar = createEnglishGrammar();
  const lexicon = createTestLexicon();
  const parser = new EarleyParser(grammar, lexicon);

  it('should calculate Reed-Kellogg layout', () => {
    const result = parser.parse(['the', 'dog', 'ran']);
    expect(result.trees.length).toBeGreaterThan(0);

    const layout = calculateReedKelloggLayout(result.trees[0]!);
    expect(layout.root).toBeDefined();
    expect(layout.width).toBeGreaterThan(0);
    expect(layout.height).toBeGreaterThan(0);
  });
});

describe('SVG Renderer', () => {
  const grammar = createEnglishGrammar();
  const lexicon = createTestLexicon();
  const parser = new EarleyParser(grammar, lexicon);

  it('should render SVG string', () => {
    const result = parser.parse(['the', 'dog', 'ran']);
    const svg = renderTreeToSVG(result.trees[0]!);

    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
    expect(svg).toContain('viewBox');
  });

  it('should include node labels', () => {
    const result = parser.parse(['the', 'dog', 'ran']);
    const svg = renderTreeToSVG(result.trees[0]!);

    expect(svg).toContain('the');
    expect(svg).toContain('dog');
    expect(svg).toContain('ran');
  });

  it('should include POS labels', () => {
    const result = parser.parse(['the', 'dog', 'ran']);
    const svg = renderTreeToSVG(result.trees[0]!);

    expect(svg).toContain('DET');
    expect(svg).toContain('>N<');
    expect(svg).toContain('>V<');
  });

  it('should render with Reed-Kellogg style', () => {
    const result = parser.parse(['the', 'dog', 'ran']);
    const svg = renderTreeToSVG(result.trees[0]!, { style: 'reed-kellogg' });

    expect(svg).toContain('<svg');
    expect(svg).toContain('the');
  });
});

describe('Buffalo Visualization', () => {
  const grammar = createEnglishGrammar();
  const lexicon = createBuffaloLexicon();
  const parser = new EarleyParser(grammar, lexicon);

  it('should render Buffalo sentence', () => {
    const result = parser.parse(['buffalo', 'buffalo', 'buffalo']);
    expect(result.trees.length).toBeGreaterThan(0);

    const svg = renderTreeToSVG(result.trees[0]!);
    expect(svg).toContain('buffalo');
    expect(svg).toContain('<svg');
  });

  it('should render gallery of multiple parses', () => {
    const result = parser.parse(['buffalo', 'buffalo', 'buffalo', 'buffalo']);
    const gallery = renderTreeGallery(result.trees);

    expect(gallery).toContain('parse-gallery');
    expect(gallery).toContain('Parse 1');
  });

  it('should handle no parses', () => {
    const gallery = renderTreeGallery([]);
    expect(gallery).toContain('No valid parses');
  });
});
