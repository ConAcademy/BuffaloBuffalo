import type { ParseTree } from '../types.js';
import { calculateLayout, calculateReedKelloggLayout, type LayoutNode, type LayoutConfig } from './layout.js';

/**
 * Render configuration options.
 */
export interface RenderConfig extends Partial<LayoutConfig> {
  style?: 'tree' | 'reed-kellogg';
  colors?: {
    node?: string;
    line?: string;
    background?: string;
  };
  wildcardPosition?: number; // 1-indexed position of Golden Buffalo wildcard
}

// POS-specific colors matching the UI
const POS_COLORS: Record<string, string> = {
  PN: '#9b59b6',  // Purple - Adjective (proper noun/city)
  N: '#2ecc71',   // Green - Noun (animal)
  V: '#e74c3c',   // Red - Verb (intimidate)
  ADV: '#3498db', // Blue - Adverb
};

const DEFAULT_COLORS = {
  node: '#4a90d9',      // Blue for phrase nodes
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
  const nodes = renderNodes(root, colors, config.wildcardPosition);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <style>
    .node-label { font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace; font-size: 12px; font-weight: bold; }
    .word-label { font-family: Georgia, 'Times New Roman', serif; font-size: 14px; font-style: italic; }
    .position-badge { font-family: 'SF Mono', Monaco, monospace; font-size: 10px; font-weight: bold; }
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

function renderNodes(node: LayoutNode, colors: typeof DEFAULT_COLORS, wildcardPosition?: number): string {
  let svg = '';

  const isWildcard = node.isTerminal && node.position === wildcardPosition;

  // Determine node color based on POS for terminals, default blue for phrases
  let fillColor = colors.node;
  if (node.isTerminal && node.pos) {
    fillColor = POS_COLORS[node.pos] ?? colors.node;
  }

  const rectHeight = node.isTerminal && node.word ? node.height / 2 : node.height;

  // Node rectangle (keep POS color even for wildcard)
  svg += `
  <rect class="node-rect"
        x="${node.x}" y="${node.y}"
        width="${node.width}" height="${rectHeight}"
        fill="${fillColor}" />`;

  // Node label (symbol/POS)
  const labelY = node.y + (node.isTerminal && node.word ? node.height / 4 : node.height / 2) + 4;
  svg += `
  <text class="node-label"
        x="${node.x + node.width / 2}" y="${labelY}"
        text-anchor="middle" fill="white">${escapeXml(node.label)}</text>`;

  // Position badge for terminals (top-right corner)
  if (node.isTerminal && node.position !== undefined) {
    const badgeX = node.x + node.width - 12;
    const badgeY = node.y + 4;
    svg += `
    <circle cx="${badgeX}" cy="${badgeY + 6}" r="8" fill="white" stroke="${fillColor}" stroke-width="1.5" />
    <text class="position-badge"
          x="${badgeX}" y="${badgeY + 10}"
          text-anchor="middle" fill="${fillColor}">${node.position}</text>`;

    // Golden star badge for wildcard (top-left corner)
    if (isWildcard) {
      const starX = node.x + 12;
      const starY = node.y + 4;
      svg += `
    <circle cx="${starX}" cy="${starY + 6}" r="8" fill="#f1c40f" stroke="#b8860b" stroke-width="1.5" />
    <text class="position-badge"
          x="${starX}" y="${starY + 10}"
          text-anchor="middle" fill="#333">✨</text>`;
    }
  }

  // Word label for terminals
  if (node.isTerminal && node.word) {
    svg += `
  <text class="word-label"
        x="${node.x + node.width / 2}" y="${node.y + node.height - 6}"
        text-anchor="middle" fill="#333">${escapeXml(node.word)}</text>`;
  }

  // Render children
  for (const child of node.children) {
    svg += renderNodes(child, colors, wildcardPosition);
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
