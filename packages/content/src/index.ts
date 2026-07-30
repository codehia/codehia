import type { SchemaContext } from 'astro:content';
import { z } from 'astro:content';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { icons as lucideIcons } from '@iconify-json/lucide/icons.json';
import type { icons as simpleIcons } from '@iconify-json/simple-icons/icons.json';

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
export const fromRoot = (path: string) => join(repoRoot, path);

export const lucideIconSchema = z.object({
	type: z.literal('lucide'),
	name: z.custom<keyof typeof lucideIcons>(),
});

export const simpleIconSchema = z.object({
	type: z.literal('simple-icons'),
	name: z.custom<keyof typeof simpleIcons>(),
});

export const iconSchema = z.union([lucideIconSchema, simpleIconSchema]);

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

// Blog/notes article schema. Publishing is opt-in: every field is optional and
// `draft` defaults to TRUE, so a note with no frontmatter (or draft: true) is
// silently excluded — it does NOT break the build. Once `draft: false`, the
// required set is enforced (see refinePublished). `tagsSchema` varies per app:
// blog uses reference('tags') (curated allowlist), notes uses z.string() (free).
export const articleSchema = (image: SchemaContext['image'], tagsSchema: z.ZodTypeAny) =>
	z
		.object({
			title: z.string().optional(),
			createdAt: z.coerce.date().optional(),
			updatedAt: z.coerce.date().optional(),
			description: z.string().optional(),
			tags: z.array(tagsSchema).optional(),
			draft: z.boolean().optional().default(true),
			image: image().optional(),
			series: z.string().optional(),
			seriesPart: z.number().optional(),
		})
		.superRefine(refinePublished);

// Projects schema. Unlike posts, `draft` defaults to FALSE (a project is written
// to be shown). Body images use Obsidian embeds; OG/banner image is frontmatter.
export const projectSchema = (image: SchemaContext['image']) =>
	z.object({
		title: z.string(),
		description: z.string(),
		date: z.coerce.date(),
		image: image(),
		link: z.string().url().optional(),
		draft: z.boolean().optional().default(false),
		info: z.array(
			z.object({
				text: z.string(),
				icon: iconSchema,
				link: z.string().url().optional(),
			})
		),
	});
