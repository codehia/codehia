import { defineCollection, reference, z } from 'astro:content';
import { file, glob } from 'astro/loaders';

// Fields required only once a post is published (`draft: false`). Pre-draft and
// draft notes may omit them; publishing an incomplete note fails the build.
const refinePublished = (
	data: {
		draft?: boolean;
		title?: unknown;
		createdAt?: unknown;
		description?: unknown;
		image?: unknown;
		tags?: unknown;
	},
	ctx: z.RefinementCtx
) => {
	if (data.draft === false) {
		for (const field of ['title', 'createdAt', 'description', 'image', 'tags'] as const) {
			if (data[field] === undefined) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: `"${field}" is required to publish (draft: false)`,
					path: [field],
				});
			}
		}
	}
};

const tags = defineCollection({
	loader: file('src/content/tags.json'),
	schema: z.object({
		id: z.string(),
	}),
});

// Content lives in the private Obsidian vault (cloned to ../../vault at build).
// Publishing is opt-in: every field is optional and `draft` defaults to TRUE,
// so a note with no frontmatter (or draft: true) is silently excluded — it does
// NOT break the build. A note publishes only when it sets `draft: false`.
const posts = defineCollection({
	loader: glob({ base: '../../vault/blogs', pattern: '**/*.md' }),
	schema: ({ image }) =>
		z
			.object({
				title: z.string().optional(),
				createdAt: z.coerce.date().optional(),
				updatedAt: z.coerce.date().optional(),
				description: z.string().optional(),
				tags: z.array(reference('tags')).optional(),
				draft: z.boolean().optional().default(true),
				image: image().optional(),
				series: z.string().optional(),
				seriesPart: z.number().optional(),
			})
			.superRefine(refinePublished),
});

export const collections = { tags, posts };
