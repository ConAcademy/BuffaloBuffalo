import type { GrammarRule, NonTerminal, ParseNode, ParseTree, ParseResult } from '../types.js';
import type { Grammar } from './grammar.js';
import type { Lexicon } from './lexicon.js';
import { isTerminal, isNonTerminal } from './grammar.js';

/**
 * An Earley item represents a partial parse.
 */
interface EarleyItem {
  rule: GrammarRule;
  dot: number;
  start: number;
  id: number;
}

/**
 * Edge in the parse forest for tree reconstruction.
 */
interface Edge {
  itemId: number;
  children: number[]; // IDs of child items/terminals
  terminalWord?: string;
}

/**
 * The Earley parser - handles ambiguous grammars and returns all valid parses.
 */
export class EarleyParser {
  private maxTrees = 100; // Limit number of trees to prevent explosion

  constructor(
    private grammar: Grammar,
    private lexicon: Lexicon
  ) {}

  /**
   * Parse an input sentence and return all valid parse trees.
   */
  parse(input: string[]): ParseResult {
    if (input.length === 0) {
      return { input, trees: [], errors: ['Empty input'] };
    }

    // Chart: array of sets, one per position
    const chart: EarleyItem[][] = [];
    const chartSet: Set<string>[] = [];
    for (let i = 0; i <= input.length; i++) {
      chart.push([]);
      chartSet.push(new Set());
    }

    let nextId = 0;
    const edges: Map<number, Edge[]> = new Map(); // itemId -> edges that completed it

    const addItem = (pos: number, rule: GrammarRule, dot: number, start: number): EarleyItem | null => {
      const key = `${rule.lhs}->${rule.rhs.join(',')}@${dot}#${start}`;
      if (chartSet[pos]!.has(key)) {
        return chart[pos]!.find(i =>
          i.rule.lhs === rule.lhs &&
          i.rule.rhs.length === rule.rhs.length &&
          i.rule.rhs.every((s, idx) => s === rule.rhs[idx]) &&
          i.dot === dot &&
          i.start === start
        ) ?? null;
      }
      chartSet[pos]!.add(key);
      const item: EarleyItem = { rule, dot, start, id: nextId++ };
      chart[pos]!.push(item);
      return item;
    };

    // Initialize with S rules
    for (const rule of this.grammar.getRulesFor('S')) {
      addItem(0, rule, 0, 0);
    }

    // Process chart
    for (let pos = 0; pos <= input.length; pos++) {
      let i = 0;
      while (i < chart[pos]!.length) {
        const item = chart[pos]![i]!;
        const nextSymbol = item.rule.rhs[item.dot];

        if (item.dot >= item.rule.rhs.length) {
          // Completion
          this.complete(chart, addItem, edges, pos, item);
        } else if (nextSymbol && isNonTerminal(nextSymbol)) {
          // Prediction
          this.predict(addItem, pos, nextSymbol);
        } else if (nextSymbol && pos < input.length) {
          // Scanning
          this.scan(chart, addItem, edges, pos, item, input[pos]!);
        }
        i++;
      }
    }

    // Extract trees and deduplicate
    const trees = this.extractTrees(chart, edges, input);
    const uniqueTrees = this.deduplicateTrees(trees);

    return {
      input,
      trees: uniqueTrees.slice(0, this.maxTrees),
      errors: uniqueTrees.length === 0 ? ['No valid parse found'] : undefined,
    };
  }

  private predict(
    addItem: (pos: number, rule: GrammarRule, dot: number, start: number) => EarleyItem | null,
    pos: number,
    symbol: NonTerminal
  ): void {
    for (const rule of this.grammar.getRulesFor(symbol)) {
      addItem(pos, rule, 0, pos);
    }
  }

  private scan(
    _chart: EarleyItem[][],
    addItem: (pos: number, rule: GrammarRule, dot: number, start: number) => EarleyItem | null,
    edges: Map<number, Edge[]>,
    pos: number,
    item: EarleyItem,
    word: string
  ): void {
    const nextSymbol = item.rule.rhs[item.dot];
    if (!nextSymbol || !isTerminal(nextSymbol)) return;

    const entries = this.lexicon.lookup(word);
    for (const entry of entries) {
      if (entry.pos === nextSymbol) {
        const newItem = addItem(pos + 1, item.rule, item.dot + 1, item.start);
        if (newItem) {
          const edgeList = edges.get(newItem.id) ?? [];
          edgeList.push({ itemId: item.id, children: [], terminalWord: word });
          edges.set(newItem.id, edgeList);
        }
      }
    }
  }

  private complete(
    chart: EarleyItem[][],
    addItem: (pos: number, rule: GrammarRule, dot: number, start: number) => EarleyItem | null,
    edges: Map<number, Edge[]>,
    pos: number,
    completedItem: EarleyItem
  ): void {
    const completedSymbol = completedItem.rule.lhs;

    for (const waitingItem of chart[completedItem.start]!) {
      const nextSymbol = waitingItem.rule.rhs[waitingItem.dot];
      if (nextSymbol === completedSymbol) {
        const newItem = addItem(pos, waitingItem.rule, waitingItem.dot + 1, waitingItem.start);
        if (newItem) {
          const edgeList = edges.get(newItem.id) ?? [];
          edgeList.push({ itemId: waitingItem.id, children: [completedItem.id] });
          edges.set(newItem.id, edgeList);
        }
      }
    }
  }

  private extractTrees(
    chart: EarleyItem[][],
    edges: Map<number, Edge[]>,
    input: string[]
  ): ParseTree[] {
    const finalPos = input.length;
    const trees: ParseTree[] = [];

    // Find completed S items
    for (const item of chart[finalPos]!) {
      if (
        item.rule.lhs === 'S' &&
        item.dot >= item.rule.rhs.length &&
        item.start === 0
      ) {
        const itemMap = new Map<number, EarleyItem>();
        for (const pos of chart) {
          for (const it of pos) {
            itemMap.set(it.id, it);
          }
        }

        const nodes = this.buildNodes(item, edges, itemMap, input, new Set());
        for (const node of nodes) {
          if (trees.length >= this.maxTrees) break;
          trees.push({ root: node, sentence: input, probability: item.rule.probability });
        }
      }
    }

    return trees;
  }

  /**
   * Remove duplicate parse trees (same structure).
   * Since all words are "buffalo", many derivations produce identical trees.
   */
  private deduplicateTrees(trees: ParseTree[]): ParseTree[] {
    const seen = new Set<string>();
    const unique: ParseTree[] = [];

    for (const tree of trees) {
      const key = this.serializeTree(tree.root);
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(tree);
      }
    }

    return unique;
  }

  /**
   * Serialize a parse tree to a string for comparison.
   * Captures structure and POS tags, ignoring derivation path.
   */
  private serializeTree(node: ParseNode): string {
    if (node.children.length === 0) {
      // Terminal: include symbol and word
      return `(${node.symbol} "${node.word ?? ''}")`;
    }
    // Non-terminal: include symbol and serialized children
    const children = node.children.map(c => this.serializeTree(c)).join(' ');
    return `(${node.symbol} ${children})`;
  }

  private buildNodes(
    item: EarleyItem,
    edges: Map<number, Edge[]>,
    itemMap: Map<number, EarleyItem>,
    input: string[],
    visiting: Set<number>
  ): ParseNode[] {
    // Cycle detection
    if (visiting.has(item.id)) {
      return [];
    }
    visiting.add(item.id);

    // If at start of rule, return node with children built from edges
    if (item.dot === 0) {
      visiting.delete(item.id);
      return [{
        symbol: item.rule.lhs,
        children: [],
        span: [item.start, item.start],
      }];
    }

    const results: ParseNode[] = [];
    const itemEdges = edges.get(item.id) ?? [];

    for (const edge of itemEdges) {
      const prevItem = itemMap.get(edge.itemId);
      if (!prevItem) continue;

      // Get trees for the previous state
      const prevNodes = this.buildNodes(prevItem, edges, itemMap, input, new Set(visiting));

      for (const prevNode of prevNodes) {
        // Build the child for the current position
        if (edge.terminalWord !== undefined) {
          // Terminal
          const terminalNode: ParseNode = {
            symbol: item.rule.rhs[item.dot - 1]!,
            children: [],
            word: edge.terminalWord,
            span: [prevNode.span[1], prevNode.span[1] + 1],
          };

          const newChildren = [...prevNode.children, terminalNode];
          results.push({
            symbol: item.rule.lhs,
            children: newChildren,
            span: [item.start, prevNode.span[1] + 1],
          });
        } else if (edge.children.length > 0) {
          // Non-terminal completion
          const childItemId = edge.children[0]!;
          const childItem = itemMap.get(childItemId);
          if (!childItem) continue;

          const childNodes = this.buildNodes(childItem, edges, itemMap, input, new Set(visiting));

          for (const childNode of childNodes) {
            const newChildren = [...prevNode.children, childNode];
            results.push({
              symbol: item.rule.lhs,
              children: newChildren,
              span: [item.start, childNode.span[1]],
            });
          }
        }

        if (results.length >= this.maxTrees) break;
      }

      if (results.length >= this.maxTrees) break;
    }

    visiting.delete(item.id);
    return results;
  }
}
