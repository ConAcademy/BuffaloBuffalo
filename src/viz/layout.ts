import type { ParseNode, ParseTree } from '../types.js';

/**
 * Layout node with calculated positions for rendering.
 */
export interface LayoutNode {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  word?: string;
  isTerminal: boolean;
  children: LayoutNode[];
  // For Reed-Kellogg style connections
  baselineY?: number;
}

/**
 * Configuration for layout calculations.
 */
export interface LayoutConfig {
  nodeWidth: number;
  nodeHeight: number;
  horizontalGap: number;
  verticalGap: number;
  padding: number;
  fontSize: number;
}

const DEFAULT_CONFIG: LayoutConfig = {
  nodeWidth: 80,
  nodeHeight: 30,
  horizontalGap: 20,
  verticalGap: 50,
  padding: 20,
  fontSize: 14,
};

/**
 * Calculate layout for a parse tree.
 * Uses a modified Reingold-Tilford algorithm for tree layout.
 */
export function calculateLayout(
  tree: ParseTree,
  config: Partial<LayoutConfig> = {}
): { root: LayoutNode; width: number; height: number } {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  // First pass: calculate subtree widths
  const root = buildLayoutNode(tree.root, cfg);

  // Second pass: assign x positions
  assignXPositions(root, cfg.padding, cfg);

  // Third pass: assign y positions
  assignYPositions(root, cfg.padding, cfg);

  // Calculate total dimensions
  const bounds = calculateBounds(root);

  return {
    root,
    width: bounds.maxX + cfg.padding,
    height: bounds.maxY + cfg.padding,
  };
}

function buildLayoutNode(node: ParseNode, cfg: LayoutConfig): LayoutNode {
  const isTerminal = node.children.length === 0;
  const label = String(node.symbol);
  const word = node.word;

  // Calculate width based on label/word length
  const textLength = Math.max(label.length, (word ?? '').length);
  const width = Math.max(cfg.nodeWidth, textLength * cfg.fontSize * 0.6 + 20);

  const children = node.children.map(child => buildLayoutNode(child, cfg));

  return {
    x: 0,
    y: 0,
    width,
    height: isTerminal && word ? cfg.nodeHeight * 2 : cfg.nodeHeight,
    label,
    word,
    isTerminal,
    children,
  };
}

function getSubtreeWidth(node: LayoutNode, cfg: LayoutConfig): number {
  if (node.children.length === 0) {
    return node.width;
  }

  const childrenWidth = node.children.reduce(
    (sum, child) => sum + getSubtreeWidth(child, cfg) + cfg.horizontalGap,
    -cfg.horizontalGap
  );

  return Math.max(node.width, childrenWidth);
}

function assignXPositions(node: LayoutNode, startX: number, cfg: LayoutConfig): number {
  const subtreeWidth = getSubtreeWidth(node, cfg);

  if (node.children.length === 0) {
    node.x = startX + (subtreeWidth - node.width) / 2;
    return subtreeWidth;
  }

  // Position children
  let currentX = startX;
  for (const child of node.children) {
    const childWidth = assignXPositions(child, currentX, cfg);
    currentX += childWidth + cfg.horizontalGap;
  }

  // Center parent over children
  const firstChild = node.children[0]!;
  const lastChild = node.children[node.children.length - 1]!;
  const childrenCenter = (firstChild.x + lastChild.x + lastChild.width) / 2;
  node.x = childrenCenter - node.width / 2;

  return subtreeWidth;
}

function assignYPositions(node: LayoutNode, startY: number, cfg: LayoutConfig): void {
  node.y = startY;
  node.baselineY = startY + node.height;

  for (const child of node.children) {
    assignYPositions(child, startY + node.height + cfg.verticalGap, cfg);
  }
}

function calculateBounds(node: LayoutNode): { maxX: number; maxY: number } {
  let maxX = node.x + node.width;
  let maxY = node.y + node.height;

  for (const child of node.children) {
    const childBounds = calculateBounds(child);
    maxX = Math.max(maxX, childBounds.maxX);
    maxY = Math.max(maxY, childBounds.maxY);
  }

  return { maxX, maxY };
}

/**
 * Alternative layout: Reed-Kellogg style (horizontal baseline).
 * This arranges terminal nodes on a baseline with structure above.
 */
export function calculateReedKelloggLayout(
  tree: ParseTree,
  config: Partial<LayoutConfig> = {}
): { root: LayoutNode; width: number; height: number } {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  // Collect terminals in order
  const terminals: LayoutNode[] = [];
  const root = buildLayoutNode(tree.root, cfg);
  collectTerminals(root, terminals);

  // Position terminals along baseline
  const baselineY = cfg.padding;
  let currentX = cfg.padding;

  for (const term of terminals) {
    term.x = currentX;
    term.y = baselineY;
    term.baselineY = baselineY + term.height;
    currentX += term.width + cfg.horizontalGap;
  }

  // Position non-terminals above their children
  positionParents(root, cfg);

  const bounds = calculateBounds(root);

  return {
    root,
    width: bounds.maxX + cfg.padding,
    height: bounds.maxY + cfg.padding,
  };
}

function collectTerminals(node: LayoutNode, terminals: LayoutNode[]): void {
  if (node.isTerminal) {
    terminals.push(node);
  } else {
    for (const child of node.children) {
      collectTerminals(child, terminals);
    }
  }
}

function positionParents(node: LayoutNode, cfg: LayoutConfig): { minX: number; maxX: number; maxY: number } {
  if (node.isTerminal) {
    return {
      minX: node.x,
      maxX: node.x + node.width,
      maxY: node.y + node.height,
    };
  }

  // Get bounds of all children
  let minX = Infinity;
  let maxX = -Infinity;
  let maxChildY = 0;

  for (const child of node.children) {
    const childBounds = positionParents(child, cfg);
    minX = Math.min(minX, childBounds.minX);
    maxX = Math.max(maxX, childBounds.maxX);
    maxChildY = Math.max(maxChildY, childBounds.maxY);
  }

  // Position this node centered above children
  node.x = (minX + maxX) / 2 - node.width / 2;
  node.y = maxChildY + cfg.verticalGap;
  node.baselineY = node.y + node.height;

  return {
    minX: Math.min(minX, node.x),
    maxX: Math.max(maxX, node.x + node.width),
    maxY: node.y + node.height,
  };
}
