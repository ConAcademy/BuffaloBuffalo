import type { ParseTree } from '../types.js';
import { calculateLayout, calculateReedKelloggLayout, type LayoutNode, type LayoutConfig } from './layout.js';

/**
 * Render configuration options.
 */
export interface RenderConfig extends Partial<LayoutConfig> {
  style?: 'tree' | 'reed-kellogg';
  colors?: {
    node?: string;
    terminal?: string;
    word?: string;
    line?: string;
    background?: string;
  };
}

const DEFAULT_COLORS = {
  node: '#4a90d9',
  terminal: '#2ecc71',
  word: '#333',
  line: '#666',
  background: '#fff',
};

/**
 * Render a parse tree as an SVG string.
 */
export function renderTreeToSVG(tree: ParseTree, config: RenderConfig = {}): string {
  const style = config.style ?? 'tree';
  const colors = { ...DEFAULT_COLORS, ...config.colors };

  const layout = style === 'reed-kellogg'
    ? calculateReedKelloggLayout(tree, config)
    : calculateLayout(tree, config);

  const { root, width, height } = layout;

  const lines = renderLines(root, colors.line);
  const nodes = renderNodes(root, colors);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <style>
    .node-label { font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace; font-size: 12px; font-weight: bold; }
    .word-label { font-family: Georgia, 'Times New Roman', serif; font-size: 14px; font-style: italic; }
    .node-rect { rx: 4; ry: 4; }
    .connector { stroke-width: 2; fill: none; }
  </style>
  <rect width="100%" height="100%" fill="${colors.background}" />
  <g class="connectors">${lines}</g>
  <g class="nodes">${nodes}</g>
</svg>`;
}

function renderLines(node: LayoutNode, color: string): string {
  let svg = '';

  const parentCenterX = node.x + node.width / 2;
  const parentBottomY = node.y + node.height;

  for (const child of node.children) {
    const childCenterX = child.x + child.width / 2;
    const childTopY = child.y;

    // Draw curved connector
    const midY = (parentBottomY + childTopY) / 2;
    svg += `
    <path class="connector"
          d="M ${parentCenterX} ${parentBottomY}
             C ${parentCenterX} ${midY}, ${childCenterX} ${midY}, ${childCenterX} ${childTopY}"
          stroke="${color}" />`;

    // Recursively render child lines
    svg += renderLines(child, color);
  }

  return svg;
}

function renderNodes(node: LayoutNode, colors: typeof DEFAULT_COLORS): string {
  let svg = '';

  // Determine node color
  const fillColor = node.isTerminal ? colors.terminal : colors.node;

  // Node rectangle
  svg += `
  <rect class="node-rect"
        x="${node.x}" y="${node.y}"
        width="${node.width}" height="${node.isTerminal && node.word ? node.height / 2 : node.height}"
        fill="${fillColor}" />`;

  // Node label (symbol/POS)
  const labelY = node.y + (node.isTerminal && node.word ? node.height / 4 : node.height / 2) + 4;
  svg += `
  <text class="node-label"
        x="${node.x + node.width / 2}" y="${labelY}"
        text-anchor="middle" fill="white">${escapeXml(node.label)}</text>`;

  // Word label for terminals
  if (node.isTerminal && node.word) {
    svg += `
  <text class="word-label"
        x="${node.x + node.width / 2}" y="${node.y + node.height - 6}"
        text-anchor="middle" fill="${colors.word}">${escapeXml(node.word)}</text>`;
  }

  // Render children
  for (const child of node.children) {
    svg += renderNodes(child, colors);
  }

  return svg;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Render a parse tree to an SVG element (for browser use).
 */
export function renderTreeToElement(tree: ParseTree, config: RenderConfig = {}): SVGSVGElement {
  const svgString = renderTreeToSVG(tree, config);
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, 'image/svg+xml');
  return doc.documentElement as unknown as SVGSVGElement;
}

/**
 * Render multiple parse trees as a gallery.
 */
export function renderTreeGallery(trees: ParseTree[], config: RenderConfig = {}): string {
  if (trees.length === 0) {
    return '<div class="no-parses">No valid parses found</div>';
  }

  const svgs = trees.map((tree, i) => {
    const svg = renderTreeToSVG(tree, config);
    return `<div class="parse-tree" data-index="${i}">
      <div class="parse-header">Parse ${i + 1} of ${trees.length}</div>
      ${svg}
    </div>`;
  });

  return `<div class="parse-gallery">${svgs.join('\n')}</div>`;
}
