import type { LexiconEntry, PartOfSpeech, GrammaticalFeatures } from '../types.js';

/**
 * A lexicon (dictionary) that maps words to their possible parts of speech.
 * Supports ambiguous words that can have multiple POS entries.
 */
export class Lexicon {
  private entries: Map<string, LexiconEntry[]> = new Map();

  /**
   * Add a word to the lexicon with a specific part of speech.
   * The same word can be added multiple times with different POS.
   */
  addWord(
    word: string,
    pos: PartOfSpeech,
    features?: GrammaticalFeatures,
    lemma?: string
  ): this {
    const entry: LexiconEntry = {
      word,
      pos,
      lemma: lemma ?? word.toLowerCase(),
      features,
    };

    const key = word.toLowerCase();
    const existing = this.entries.get(key) ?? [];
    existing.push(entry);
    this.entries.set(key, existing);

    return this;
  }

  /**
   * Look up all possible lexicon entries for a word.
   * Returns empty array if word is not in lexicon.
   */
  lookup(word: string): LexiconEntry[] {
    return this.entries.get(word.toLowerCase()) ?? [];
  }

  /**
   * Check if a word exists in the lexicon.
   */
  has(word: string): boolean {
    return this.entries.has(word.toLowerCase());
  }

  /**
   * Get all words in the lexicon.
   */
  words(): string[] {
    return Array.from(this.entries.keys());
  }

  /**
   * Get the total number of entries (including multiple POS per word).
   */
  get size(): number {
    let count = 0;
    for (const entries of this.entries.values()) {
      count += entries.length;
    }
    return count;
  }
}

/**
 * Create a test lexicon with common English words for parser testing.
 * Does NOT include "buffalo" - that's in the Buffalo-specific lexicon.
 */
export function createTestLexicon(): Lexicon {
  const lex = new Lexicon();

  // Determiners
  lex.addWord('the', 'DET');
  lex.addWord('a', 'DET');
  lex.addWord('an', 'DET');

  // Nouns
  lex.addWord('dog', 'N', { number: 'singular' });
  lex.addWord('dogs', 'N', { number: 'plural' }, 'dog');
  lex.addWord('cat', 'N', { number: 'singular' });
  lex.addWord('cats', 'N', { number: 'plural' }, 'cat');
  lex.addWord('man', 'N', { number: 'singular' });
  lex.addWord('men', 'N', { number: 'plural' }, 'man');
  lex.addWord('woman', 'N', { number: 'singular' });
  lex.addWord('women', 'N', { number: 'plural' }, 'woman');
  lex.addWord('bird', 'N', { number: 'singular' });
  lex.addWord('birds', 'N', { number: 'plural' }, 'bird');
  lex.addWord('fish', 'N', { number: 'singular' });
  lex.addWord('fish', 'N', { number: 'plural' }); // fish is same singular/plural

  // Verbs
  lex.addWord('chased', 'V', { tense: 'past' }, 'chase');
  lex.addWord('chase', 'V', { tense: 'present' });
  lex.addWord('chases', 'V', { tense: 'present', number: 'singular', person: 3 }, 'chase');
  lex.addWord('bit', 'V', { tense: 'past' }, 'bite');
  lex.addWord('bite', 'V', { tense: 'present' });
  lex.addWord('bites', 'V', { tense: 'present', number: 'singular', person: 3 }, 'bite');
  lex.addWord('ran', 'V', { tense: 'past' }, 'run');
  lex.addWord('run', 'V', { tense: 'present' });
  lex.addWord('runs', 'V', { tense: 'present', number: 'singular', person: 3 }, 'run');
  lex.addWord('saw', 'V', { tense: 'past' }, 'see');
  lex.addWord('see', 'V', { tense: 'present' });
  lex.addWord('sees', 'V', { tense: 'present', number: 'singular', person: 3 }, 'see');
  lex.addWord('ate', 'V', { tense: 'past' }, 'eat');
  lex.addWord('eat', 'V', { tense: 'present' });
  lex.addWord('eats', 'V', { tense: 'present', number: 'singular', person: 3 }, 'eat');

  // Adjectives
  lex.addWord('big', 'ADJ');
  lex.addWord('small', 'ADJ');
  lex.addWord('fast', 'ADJ');
  lex.addWord('slow', 'ADJ');

  // Adverbs
  lex.addWord('quickly', 'ADV');
  lex.addWord('slowly', 'ADV');
  lex.addWord('away', 'ADV');

  // Prepositions
  lex.addWord('in', 'PREP');
  lex.addWord('on', 'PREP');
  lex.addWord('with', 'PREP');
  lex.addWord('to', 'PREP');
  lex.addWord('from', 'PREP');

  // Relative pronouns
  lex.addWord('who', 'REL');
  lex.addWord('whom', 'REL');
  lex.addWord('that', 'REL');
  lex.addWord('which', 'REL');

  // Conjunctions
  lex.addWord('and', 'CONJ');
  lex.addWord('or', 'CONJ');

  return lex;
}

/**
 * Create the Buffalo-only lexicon for Buffalo sentence parsing.
 */
export function createBuffaloLexicon(): Lexicon {
  const lex = new Lexicon();

  // Buffalo (proper noun) - the city in New York
  lex.addWord('Buffalo', 'PN', undefined, 'buffalo');

  // buffalo (noun) - the animal (works for both singular and plural)
  lex.addWord('buffalo', 'N', { number: 'plural' });
  lex.addWord('buffalo', 'N', { number: 'singular' });

  // buffalo (verb) - to intimidate (works for plural subjects in present)
  lex.addWord('buffalo', 'V', { tense: 'present', number: 'plural' });
  lex.addWord('buffalo', 'V', { tense: 'present', number: 'singular', person: 1 });
  lex.addWord('buffalo', 'V', { tense: 'present', number: 'singular', person: 2 });

  // buffalo (adverb) - in a buffalo-like manner (creative interpretation)
  lex.addWord('buffalo', 'ADV');

  return lex;
}
