import { defineCollection, z } from 'astro:content';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { glob } from 'astro/loaders';

// Resolve paths from the workspace root. Content loaders (glob/file) take
// filesystem paths, not Vite aliases. Rather than count `../` levels (which
// breaks if this file moves), we walk up to the pnpm-workspace.yaml marker —
// so the depth of this file no longer matters.
function findRepoRoot(dir: string): string {
	while (!existsSync(join(dir, 'pnpm-workspace.yaml'))) {
		const parent = dirname(dir);
		if (parent === dir) throw new Error('workspace root (pnpm-workspace.yaml) not found');
		dir = parent;
	}
	return dir;
}
const repoRoot = findRepoRoot(dirname(fileURLToPath(import.meta.url)));
const fromRoot = (path: string) => join(repoRoot, path);

// Fields required only once a note is published (`draft: false`). Pre-draft and
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

// Content lives in the private Obsidian vault (cloned to ../../vault at build).
// Publishing is opt-in: every field is optional and `draft` defaults to TRUE,
// so a note with no frontmatter (or draft: true) is silently excluded — it does
// NOT break the build. A note publishes only when it sets `draft: false`.
const notes = defineCollection({
	loader: glob({ base: fromRoot('vault/notes'), pattern: '**/*.md' }),
	schema: ({ image }) =>
		z
			.object({
				title: z.string().optional(),
				createdAt: z.coerce.date().optional(),
				updatedAt: z.coerce.date().optional(),
				description: z.string().optional(),
				tags: z.array(z.string()).optional(),
				draft: z.boolean().optional().default(true),
				image: image().optional(),
				series: z.string().optional(),
				seriesPart: z.number().optional(),
			})
			.superRefine(refinePublished),
});

export const collections = { notes };
