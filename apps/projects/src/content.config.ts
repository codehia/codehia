import { defineCollection, z } from 'astro:content';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { icons as lucideIcons } from '@iconify-json/lucide/icons.json';
import type { icons as simpleIcons } from '@iconify-json/simple-icons/icons.json';
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

const lucideIconSchema = z.object({
	type: z.literal('lucide'),
	name: z.custom<keyof typeof lucideIcons>(),
});

const simpleIconSchema = z.object({
	type: z.literal('simple-icons'),
	name: z.custom<keyof typeof simpleIcons>(),
});

// Projects live in the private Obsidian vault (cloned to ./vault at build).
// Each `vault/projects/<name>.md` renders at `/<name>`. Publishing is opt-in:
// `draft` defaults to false here (a project is written to be shown), unlike
// posts. Body images use Obsidian embeds; the OG/banner image is frontmatter.
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
	projects,
};
