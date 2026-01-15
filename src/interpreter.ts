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
}

/**
 * Interpret a parse tree into readable English.
 */
export function interpretTree(tree: ParseTree): string {
  const ctx: InterpretContext = {
    isSubject: true,
    isMainNoun: true,
    depth: 0,
  };

  const result = interpretNode(tree.root, ctx);

  // Capitalize first letter and add period
  return capitalizeFirst(result.trim()) + '.';
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
    return interpretTerminal(symbol, word);
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
function interpretTerminal(symbol: string, word: string): string {
  switch (symbol) {
    case 'PN':
      // Proper noun Buffalo = the city (handled specially in NP)
      return 'Buffalo';
    case 'N':
      // Noun buffalo = bison
      return 'bison';
    case 'V':
      // Verb buffalo = intimidate
      return 'intimidate';
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
  // Single child cases
  if (children.length === 1) {
    const child = children[0]!;
    if (child.symbol === 'N') {
      // NP → N (bare noun)
      return 'bison';
    }
    if (child.symbol === 'PN') {
      // NP → PN (proper noun as noun phrase - rare, means the city itself)
      return 'Buffalo';
    }
    return interpretNode(child, ctx);
  }

  // Two children
  if (children.length === 2) {
    const first = children[0]!;
    const second = children[1]!;

    // NP → PN N ("Buffalo buffalo" = bison from Buffalo)
    if (first.symbol === 'PN' && second.symbol === 'N') {
      return 'bison from Buffalo';
    }

    // NP → NP N (noun phrase + noun, rare)
    if (first.symbol === 'NP' && second.symbol === 'N') {
      const firstPart = interpretNode(first, { ...ctx, isMainNoun: false });
      return `${firstPart} bison`;
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
      return `the bison`;
    }

    // NP → ADJ N
    if (first.symbol === 'ADJ' && second.symbol === 'N') {
      const adj = interpretNode(first, ctx);
      return `${adj} bison`;
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
  if (children.length === 1) {
    // VP → V (intransitive)
    return 'intimidate';
  }

  if (children.length === 2) {
    const first = children[0]!;
    const second = children[1]!;

    // VP → V NP (transitive)
    if (first.symbol === 'V' && second.symbol === 'NP') {
      const obj = interpretNode(second, { ...ctx, isSubject: false, isMainNoun: false });
      return `intimidate ${obj}`;
    }

    // VP → V PP
    if (first.symbol === 'V' && second.symbol === 'PP') {
      const pp = interpretNode(second, ctx);
      return `intimidate ${pp}`;
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
