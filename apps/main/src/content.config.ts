import { defineCollection, reference, z } from 'astro:content';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { icons as lucideIcons } from '@iconify-json/lucide/icons.json';
import type { icons as simpleIcons } from '@iconify-json/simple-icons/icons.json';
import { file, glob } from 'astro/loaders';

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

const other = defineCollection({
	loader: glob({ base: 'src/content/other', pattern: '**/*.{md,mdx}' }),
});

const lucideIconSchema = z.object({
	type: z.literal('lucide'),
	name: z.custom<keyof typeof lucideIcons>(),
});

const simpleIconSchema = z.object({
	type: z.literal('simple-icons'),
	name: z.custom<keyof typeof simpleIcons>(),
});

const quickInfo = defineCollection({
	loader: file('src/content/info.json'),
	schema: z.object({
		id: z.number(),
		icon: z.union([lucideIconSchema, simpleIconSchema]),
		text: z.string(),
		link: z.string().optional(),
	}),
});

const socials = defineCollection({
	loader: file('src/content/socials.json'),
	schema: z.object({
		id: z.number(),
		icon: z.union([lucideIconSchema, simpleIconSchema]),
		text: z.string(),
		link: z.string().url(),
	}),
});

const workExperience = defineCollection({
	loader: file('src/content/work.json'),
	schema: z.object({
		id: z.number(),
		title: z.string(),
		company: z.string(),
		duration: z.string(),
		description: z.array(z.string()),
	}),
});

const tags = defineCollection({
	// Single-sourced from the blog app: main reads these files at build time only
	// for the home "Latest Posts" feed. Cards link out to the blog subdomain
	// (see siteUrls.blog). This is a filesystem path, not a URL.
	loader: file(fromRoot('apps/blog/src/content/tags.json')),
	schema: z.object({
		id: z.string(),
	}),
});

// Content lives in the private Obsidian vault (cloned to ./vault at build).
// Main reads posts only for the home "Latest Posts" feed; cards link out to the
// blog subdomain. Publishing is opt-in: fields are optional and `draft` defaults
// to TRUE, so a note with no frontmatter is silently excluded (no build break).
// But once `draft: false`, the required set is enforced (see refinePublished).
const posts = defineCollection({
	loader: glob({ base: fromRoot('vault/blogs'), pattern: '**/*.md' }),
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

// Projects live in the private vault (cloned to ./vault at build). Main reads
// them only for the home "Latest Projects" feed; cards link out to the projects
// subdomain (see siteUrls.projects). Filesystem path, not a URL.
const projects = defineCollection({
	loader: glob({ base: fromRoot('vault/projects'), pattern: '**/*.md' }),
	schema: ({ image }) =>
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
					icon: z.union([lucideIconSchema, simpleIconSchema]),
					link: z.string().url().optional(),
				})
			),
		}),
});

export const collections = {
	tags,
	posts,
	projects,
	other,
	quickInfo,
	socials,
	workExperience,
};
