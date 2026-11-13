import { fileURLToPath } from 'node:url';
import type { AstroIntegration } from 'astro';
import { z } from 'astro/zod';
import { viteVirtualModulePluginBuilder } from './utils/virtual-module-plugin-builder';

const openGraphOptionsSchema = z.object({
	/**
	 * The title of the page.
	 */
	title: z.string(),
	/**
	 * The description of the page. Optional.
	 */
	description: z.string().optional(),
});

export const optionsSchema = z.object({
	/**
	 * The name that should be displayed on the main page.
	 */
	name: z.string(),
	/**
	 * The theme color of the site. Optional. Defaults to `#8c5cf5`.
	 */
	themeColor: z.string().optional(),
	/**
	 * Open Graph meta tags for various pages.
	 */
	openGraph: z.object({
		/**
		 * Open Graph meta tags for the home page.
		 */
		home: openGraphOptionsSchema.optional(),
		/**
		 * Open Graph meta tags for the blog page.
		 */
		blog: openGraphOptionsSchema.optional(),
		/**
		 * Open Graph meta tags for the projects page.
		 */
		projects: openGraphOptionsSchema.optional(),
		/**
		 * Open Graph meta tags for the notes page.
		 */
		notes: openGraphOptionsSchema.optional(),
	}),
});

export default function integration(options: z.infer<typeof optionsSchema>): AstroIntegration {
	const validatedOptions = optionsSchema.parse(options);

	const globals = viteVirtualModulePluginBuilder(
		'spectre:globals',
		'spectre-theme-globals',
		`
    export const name = ${JSON.stringify(validatedOptions.name)};
    export const themeColor = ${JSON.stringify(validatedOptions.themeColor ?? '#8c5cf5')};
    export const openGraph = {
      home: ${JSON.stringify(validatedOptions.openGraph.home)},
      blog: ${JSON.stringify(validatedOptions.openGraph.blog)},
      projects: ${JSON.stringify(validatedOptions.openGraph.projects)},
      notes: ${JSON.stringify(validatedOptions.openGraph.notes)},
    };
  `
	);

	return {
		name: 'spectre-theme',
		hooks: {
			'astro:config:setup': ({ config, updateConfig, injectRoute }) => {
				// Private Obsidian vault, cloned to <repo>/vault at build time. Apps
				// live at <repo>/apps/<app>, so it is two levels above the app root.
				const vaultDir = fileURLToPath(new URL('../../vault', config.root));

				updateConfig({
					vite: {
						plugins: [globals()],
						// Depth-proof Vite aliases for vault imports: frontmatter
						// `image: "@assets/foo.png"` and Obsidian body embeds resolve here
						// regardless of note nesting depth.
						// NOTE: Vite aliases apply to module/asset imports only — the
						// content-loader `base` in content.config.ts uses a filesystem
						// path, not these aliases.
						resolve: {
							alias: {
								'@vault': vaultDir,
								'@assets': `${vaultDir}/assets`,
							},
						},
					},
				});

				injectRoute({
					pattern: '/pagefind/pagefind.js',
					entrypoint: fileURLToPath(new URL('./pagefind-stub.ts', import.meta.url)),
				});
			},
		},
	};
}
