import { defineCollection, reference, z } from 'astro:content';
import { file, glob } from 'astro/loaders';

const tags = defineCollection({
	loader: file('src/content/tags.json'),
	schema: z.object({
		id: z.string(),
	}),
});

const posts = defineCollection({
	loader: glob({ base: 'src/content/posts', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			createdAt: z.coerce.date(),
			updatedAt: z.coerce.date().optional(),
			description: z.string(),
			tags: z.array(reference('tags')),
			draft: z.boolean().optional().default(false),
			image: image(),
			series: z.string().optional(),
			seriesPart: z.number().optional(),
		}),
});

export const collections = { tags, posts };
