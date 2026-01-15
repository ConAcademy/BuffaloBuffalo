# BuffaloBuffalo

A web application for constructing, visualizing, and interpreting [Buffalo sentences](https://en.wikipedia.org/wiki/Buffalo_buffalo_Buffalo_buffalo_buffalo_buffalo_Buffalo_buffalo) — the classic linguistic example demonstrating how a single word can function as multiple parts of speech.

## What is a Buffalo Sentence?

"Buffalo buffalo Buffalo buffalo buffalo buffalo Buffalo buffalo" is a grammatically correct sentence. It works because "buffalo" can be:
- A **noun** (the animal)
- A **proper noun** (the city in New York)
- A **verb** (to intimidate or bully)

The famous sentence means: "Bison from Buffalo, NY, that bison from Buffalo, NY intimidate, themselves intimidate bison from Buffalo, NY."

## Features

- **Sentence Builder**: Construct Buffalo sentences by selecting words with specific parts of speech, or use wildcards for automatic parsing
- **Parse Tree Generator**: A generic English parser that generates valid parse trees given a dictionary
- **Visualization**: View sentence structure using elementary school-style sentence diagrams
- **LLM Interpretation**: Submit sentences for AI-powered interpretation based on the parsed structure

## Tech Stack

- TypeScript
- Lightweight web framework (TBD)
- LLM integration for sentence interpretation

## Project Structure

```
BuffaloBuffalo/
├── README.md      # This file - human documentation
├── AGENTS.md      # Agent-focused documentation
├── MEMORY.md      # Long-term working concepts
├── PLAN.md        # Implementation plan
└── PROMPTS.md     # Auto-generated (read-only)
```

## Inspiration

Inspired by Professor Stephen Pinker's demonstration in MIT's 9.01 course, showing how syntax and semantics interact in natural language.
