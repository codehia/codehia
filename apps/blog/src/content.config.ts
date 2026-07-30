import { defineCollection, reference, z } from 'astro:content';
import { articleSchema, fromRoot } from '@codehia/content';
import { file, glob } from 'astro/loaders';

const tags = defineCollection({
	loader: file('src/content/tags.json'),
	schema: z.object({
		id: z.string(),
	}),
});

// Content lives in the private Obsidian vault (cloned to <repo>/vault at build).
const posts = defineCollection({
	loader: glob({ base: fromRoot('vault/blogs'), pattern: '**/*.md' }),
	schema: ({ image }) => articleSchema(image, reference('tags')),
});

export const collections = { tags, posts };
