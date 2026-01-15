import type { ParseTree, ParseNode } from './types.js';

/**
 * Interprets a Buffalo sentence parse tree into readable English.
 *
 * Mappings:
 * - PN (Buffalo) = the city Buffalo, NY → "from Buffalo"
 * - N (buffalo) = the animal → "bison"
 * - V (buffalo) = to intimidate → "intimidate"
 */

interface InterpretContext {
  /** Whether we're in a subject position (vs object) */
  isSubject: boolean;
  /** Whether this is the first/main noun in a sentence */
  isMainNoun: boolean;
  /** Depth in the tree (for relative clause handling) */
  depth: number;
  /** Whether to output HTML with color coding */
  html: boolean;
  /** Position counter for superscript numbers (shared object for mutation) */
  position: { value: number };
}

// Color classes matching the visualization
const COLOR_PN = 'interp-pn';  // Purple - location/adjective
const COLOR_N = 'interp-n';    // Green - noun (bison)
const COLOR_V = 'interp-v';    // Red - verb (intimidate)

function wrap(text: string, colorClass: string, html: boolean, position?: { value: number }): string {
  if (!html) return text;
  if (position) {
    const pos = position.value++;
    return `<span class="${colorClass}">${text}<sup class="interp-pos">${pos}</sup></span>`;
  }
  return `<span class="${colorClass}">${text}</span>`;
}

/**
 * Interpret a parse tree into readable English.
 */
export function interpretTree(tree: ParseTree): string {
  const ctx: InterpretContext = {
    isSubject: true,
    isMainNoun: true,
    depth: 0,
    html: false,
    position: { value: 1 },
  };

  const result = interpretNode(tree.root, ctx);

  // Capitalize first letter and add period
  return capitalizeFirst(result.trim()) + '.';
}

/**
 * Interpret a parse tree into HTML with color-coded parts of speech.
 */
export function interpretTreeHTML(tree: ParseTree): string {
  const ctx: InterpretContext = {
    isSubject: true,
    isMainNoun: true,
    depth: 0,
    html: true,
    position: { value: 1 },
  };

  const result = interpretNode(tree.root, ctx);

  // Capitalize first letter and add period
  return capitalizeFirstHTML(result.trim()) + '.';
}

function capitalizeFirstHTML(s: string): string {
  if (!s) return s;
  // Handle HTML tags - find all leading tags and first actual character
  const match = s.match(/^((?:<[^>]+>)*)(.)/);
  if (match) {
    const allTags = match[1] || '';
    const firstChar = match[2]!;
    const rest = s.slice(allTags.length + 1);
    return allTags + firstChar.toUpperCase() + rest;
  }
  return s;
}

function capitalizeFirst(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Recursively interpret a parse node.
 */
function interpretNode(node: ParseNode, ctx: InterpretContext): string {
  const { symbol, children, word } = node;

  // Terminal nodes
  if (children.length === 0 && word) {
    return interpretTerminal(symbol, word, ctx);
  }

  // Non-terminal nodes
  switch (symbol) {
    case 'S':
      return interpretSentence(children, ctx);
    case 'NP':
      return interpretNounPhrase(children, ctx);
    case 'VP':
      return interpretVerbPhrase(children, ctx);
    case 'RC':
      return interpretRelativeClause(children, ctx);
    case 'PP':
      return interpretPrepPhrase(children, ctx);
    default:
      // Fallback: just concatenate children
      return children.map(c => interpretNode(c, ctx)).join(' ');
  }
}

/**
 * Interpret a terminal node (actual word).
 */
function interpretTerminal(symbol: string, word: string, ctx: InterpretContext): string {
  const { html, position } = ctx;
  switch (symbol) {
    case 'PN':
      // Proper noun Buffalo = the city (handled specially in NP)
      return wrap('Buffalo', COLOR_PN, html, position);
    case 'N':
      // Noun buffalo = bison
      return wrap('bison', COLOR_N, html, position);
    case 'V':
      // Verb buffalo = intimidate
      return wrap('intimidate', COLOR_V, html, position);
    default:
      return word;
  }
}

/**
 * Interpret a sentence (S).
 */
function interpretSentence(children: ParseNode[], ctx: InterpretContext): string {
  if (children.length === 1) {
    // S → NP (exclamatory) or S → VP (imperative)
    const child = children[0]!;
    if (child.symbol === 'VP') {
      // Imperative: "Intimidate!"
      return interpretNode(child, { ...ctx, isSubject: false });
    }
    // Exclamatory noun phrase
    return interpretNode(child, ctx);
  }

  if (children.length === 2) {
    // S → NP VP
    const np = children[0]!;
    const vp = children[1]!;
    const subject = interpretNode(np, { ...ctx, isSubject: true, isMainNoun: true });
    const predicate = interpretNode(vp, { ...ctx, isSubject: false, isMainNoun: false });
    return `${subject} ${predicate}`;
  }

  if (children.length === 3 && children[1]!.symbol === 'CONJ') {
    // S → S CONJ S
    const left = interpretNode(children[0]!, ctx);
    const right = interpretNode(children[2]!, ctx);
    return `${left}, and ${right}`;
  }

  return children.map(c => interpretNode(c, ctx)).join(' ');
}

/**
 * Interpret a noun phrase (NP).
 */
function interpretNounPhrase(children: ParseNode[], ctx: InterpretContext): string {
  const { html, position } = ctx;

  // Single child cases
  if (children.length === 1) {
    const child = children[0]!;
    if (child.symbol === 'N') {
      // NP → N (bare noun)
      return wrap('bison', COLOR_N, html, position);
    }
    if (child.symbol === 'PN') {
      // NP → PN (proper noun as noun phrase - rare, means the city itself)
      return wrap('Buffalo', COLOR_PN, html, position);
    }
    return interpretNode(child, ctx);
  }

  // Two children
  if (children.length === 2) {
    const first = children[0]!;
    const second = children[1]!;

    // NP → PN N ("Buffalo buffalo" = bison from Buffalo)
    if (first.symbol === 'PN' && second.symbol === 'N') {
      // Note: PN comes before N in tree order, so we output in a way that increments correctly
      const pnPart = wrap('Buffalo', COLOR_PN, html, position);
      const nPart = wrap('bison', COLOR_N, html, position);
      return `${nPart} from ${pnPart}`;
    }

    // NP → NP N (noun phrase + noun, rare)
    if (first.symbol === 'NP' && second.symbol === 'N') {
      const firstPart = interpretNode(first, { ...ctx, isMainNoun: false });
      return `${firstPart} ${wrap('bison', COLOR_N, html, position)}`;
    }

    // NP → NP RC (noun phrase with relative clause)
    if (first.symbol === 'NP' && second.symbol === 'RC') {
      const np = interpretNode(first, { ...ctx, isMainNoun: true });
      const rc = interpretNode(second, { ...ctx, depth: ctx.depth + 1, isMainNoun: false });
      return `${np} ${rc}`;
    }

    // NP → NP PP (noun phrase with prepositional phrase)
    if (first.symbol === 'NP' && second.symbol === 'PP') {
      const np = interpretNode(first, ctx);
      const pp = interpretNode(second, ctx);
      return `${np} ${pp}`;
    }

    // NP → DET N
    if (first.symbol === 'DET' && second.symbol === 'N') {
      return `the ${wrap('bison', COLOR_N, html, position)}`;
    }

    // NP → ADJ N
    if (first.symbol === 'ADJ' && second.symbol === 'N') {
      const adj = interpretNode(first, ctx);
      return `${adj} ${wrap('bison', COLOR_N, html, position)}`;
    }
  }

  // Three children: NP → NP CONJ NP or DET ADJ N
  if (children.length === 3) {
    if (children[1]!.symbol === 'CONJ') {
      const left = interpretNode(children[0]!, ctx);
      const right = interpretNode(children[2]!, ctx);
      return `${left} and ${right}`;
    }
  }

  // Fallback
  return children.map(c => interpretNode(c, ctx)).join(' ');
}

/**
 * Interpret a verb phrase (VP).
 */
function interpretVerbPhrase(children: ParseNode[], ctx: InterpretContext): string {
  const { html, position } = ctx;

  if (children.length === 1) {
    // VP → V (intransitive)
    return wrap('intimidate', COLOR_V, html, position);
  }

  if (children.length === 2) {
    const first = children[0]!;
    const second = children[1]!;

    // VP → V NP (transitive)
    if (first.symbol === 'V' && second.symbol === 'NP') {
      const verb = wrap('intimidate', COLOR_V, html, position);
      const obj = interpretNode(second, { ...ctx, isSubject: false, isMainNoun: false });
      return `${verb} ${obj}`;
    }

    // VP → V PP
    if (first.symbol === 'V' && second.symbol === 'PP') {
      const verb = wrap('intimidate', COLOR_V, html, position);
      const pp = interpretNode(second, ctx);
      return `${verb} ${pp}`;
    }
  }

  if (children.length === 3 && children[1]!.symbol === 'CONJ') {
    // VP → VP CONJ VP
    const left = interpretNode(children[0]!, ctx);
    const right = interpretNode(children[2]!, ctx);
    return `${left} and ${right}`;
  }

  // Fallback
  const parts = children.map(c => interpretNode(c, ctx));
  return parts.join(' ');
}

/**
 * Interpret a relative clause (RC).
 * This is the trickiest part for Buffalo sentences.
 */
function interpretRelativeClause(children: ParseNode[], ctx: InterpretContext): string {
  // RC → NP VP (reduced relative clause - most common in Buffalo sentences)
  // "buffalo [that] Buffalo buffalo buffalo"
  // = bison [that] bison from Buffalo intimidate
  if (children.length === 2) {
    const first = children[0]!;
    const second = children[1]!;

    if (first.symbol === 'NP' && second.symbol === 'VP') {
      // Reduced relative: the subject of the RC does the action to the main NP
      const rcSubject = interpretNode(first, { ...ctx, isSubject: true, isMainNoun: false, depth: ctx.depth + 1 });
      const rcVerb = interpretNode(second, { ...ctx, isSubject: false, depth: ctx.depth + 1 });
      return `that ${rcSubject} ${rcVerb}`;
    }

    // RC → REL VP ("that intimidate")
    if (first.symbol === 'REL' && second.symbol === 'VP') {
      const vp = interpretNode(second, ctx);
      return `that ${vp}`;
    }

    // RC → REL S
    if (first.symbol === 'REL' && second.symbol === 'S') {
      const s = interpretNode(second, { ...ctx, depth: ctx.depth + 1 });
      return `that ${s}`;
    }
  }

  // RC → S (reduced relative with extracted subject)
  if (children.length === 1 && children[0]!.symbol === 'S') {
    const s = interpretNode(children[0]!, { ...ctx, depth: ctx.depth + 1 });
    return `that ${s}`;
  }

  // Fallback
  return 'that ' + children.map(c => interpretNode(c, ctx)).join(' ');
}

/**
 * Interpret a prepositional phrase (PP).
 */
function interpretPrepPhrase(children: ParseNode[], ctx: InterpretContext): string {
  if (children.length === 2) {
    const prep = children[0]!;
    const np = children[1]!;
    const prepWord = interpretNode(prep, ctx);
    const npPart = interpretNode(np, ctx);
    return `${prepWord} ${npPart}`;
  }
  return children.map(c => interpretNode(c, ctx)).join(' ');
}
