# BuffaloBuffalo

A web application for constructing, visualizing, and interpreting [Buffalo sentences](https://en.wikipedia.org/wiki/Buffalo_buffalo_Buffalo_buffalo_buffalo_buffalo_Buffalo_buffalo) — the classic linguistic example demonstrating how a single word can function as multiple parts of speech.

## What is a Buffalo Sentence?

"Buffalo buffalo Buffalo buffalo buffalo buffalo Buffalo buffalo" is a grammatically correct sentence. It works because "buffalo" can be:
- A **noun** (the animal)
- A **proper noun** (the city in New York)
- A **verb** (to intimidate or bully)

The famous sentence means: "Bison from Buffalo, NY, that bison from Buffalo, NY intimidate, themselves intimidate bison from Buffalo, NY."

## Quick Start

```bash
# Install dependencies
npm install

# Run the app
npm run dev
```

Then open http://localhost:5173 in your browser.

## Usage

1. Click the colored buttons to build a sentence:
   - **Purple** = Buffalo (the city)
   - **Green** = buffalo (the animal)
   - **Red** = buffalo (the verb)

2. Click **Parse!** to see the parse tree

3. Use **← Previous / Next →** to browse multiple valid parses

4. Toggle between **Tree** and **Reed-Kellogg** diagram styles

## Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run test       # Run tests in watch mode
npm run test:run   # Run tests once
npm run typecheck  # Check TypeScript types
```

## Features

- **Sentence Builder**: Construct Buffalo sentences by clicking POS buttons
- **Earley Parser**: Handles ambiguous grammars, returns all valid parses
- **Visualization**: SVG-based tree diagrams with two layout styles
- **Zero Dependencies**: Pure TypeScript, no runtime frameworks

## Tech Stack

- TypeScript (strict mode)
- Vite (build tooling)
- Vitest (testing)
- Vanilla JS (no UI framework)

## Project Structure

```
BuffaloBuffalo/
├── index.html           # Web app entry point
├── package.json
├── tsconfig.json
├── vite.config.ts
├── src/
│   ├── index.ts         # Main exports
│   ├── types.ts         # Type definitions
│   ├── parser/
│   │   ├── lexicon.ts   # Word dictionary
│   │   ├── grammar.ts   # CFG rules
│   │   └── earley.ts    # Earley parser
│   └── viz/
│       ├── layout.ts    # Tree layout algorithms
│       └── renderer.ts  # SVG rendering
├── README.md            # This file
├── AGENTS.md            # Agent documentation
├── MEMORY.md            # Technical decisions
└── PLAN.md              # Implementation plan
```

## Inspiration

Inspired by Professor Stephen Pinker's demonstration in MIT's 9.01 course, showing how syntax and semantics interact in natural language.
