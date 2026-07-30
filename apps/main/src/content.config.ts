import { defineCollection, reference, z } from 'astro:content';
import { articleSchema, fromRoot, iconSchema, projectSchema } from '@codehia/content';
import { file, glob } from 'astro/loaders';

const other = defineCollection({
	loader: glob({ base: 'src/content/other', pattern: '**/*.{md,mdx}' }),
});

const quickInfo = defineCollection({
	loader: file('src/content/info.json'),
	schema: z.object({
		id: z.number(),
		icon: iconSchema,
		text: z.string(),
		link: z.string().optional(),
	}),
});

const socials = defineCollection({
	loader: file('src/content/socials.json'),
	schema: z.object({
		id: z.number(),
		icon: iconSchema,
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

// Content lives in the private Obsidian vault (cloned to <repo>/vault at build).
// Main reads posts/projects only for the home "Latest" feeds; cards link out to
// the blog/projects subdomains. Filesystem paths, not URLs.
const posts = defineCollection({
	loader: glob({ base: fromRoot('vault/blogs'), pattern: '**/*.md' }),
	schema: ({ image }) => articleSchema(image, reference('tags')),
});

const projects = defineCollection({
	loader: glob({ base: fromRoot('vault/projects'), pattern: '**/*.md' }),
	schema: ({ image }) => projectSchema(image),
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
