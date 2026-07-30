import { defineCollection, z } from 'astro:content';
import { articleSchema, fromRoot } from '@codehia/content';
import { glob } from 'astro/loaders';

// Content lives in the private Obsidian vault (cloned to <repo>/vault at build).
// Tags are free-form strings (no curated allowlist, unlike blog) — personal,
// fast-moving notes. A typo just creates a new tag; no build gate.
const notes = defineCollection({
	loader: glob({ base: fromRoot('vault/notes'), pattern: '**/*.md' }),
	schema: ({ image }) => articleSchema(image, z.string()),
});

export const collections = { notes };
