import { defineCollection } from 'astro:content';
import { fromRoot, projectSchema } from '@codehia/content';
import { glob } from 'astro/loaders';

// Projects live in the private Obsidian vault (cloned to <repo>/vault at build).
// Each `vault/projects/<name>.md` renders at `/<name>`.
const projects = defineCollection({
	loader: glob({ base: fromRoot('vault/projects'), pattern: '**/*.md' }),
	schema: ({ image }) => projectSchema(image),
});

export const collections = { projects };
