import { fileURLToPath } from 'node:url';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import spectre from '@codehia/spectre';
import { defineConfig } from 'astro/config';
import expressiveCode from 'astro-expressive-code';
import { spectreDark } from './src/ec-theme';

// Private Obsidian vault, cloned to <repo>/vault at build time.
const vaultDir = fileURLToPath(new URL('../../vault', import.meta.url));

// https://astro.build/config
const config = defineConfig({
	site: 'https://blog.sacharya.dev',
	server: { port: 4322 },
	output: 'static',
	// Depth-proof Vite aliases for vault imports: frontmatter `image: "@assets/foo.png"`
	// and Obsidian body embeds resolve here regardless of note nesting depth.
	// NOTE: Vite aliases apply to module/asset imports only — the content-loader
	// `base` in content.config.ts uses a filesystem path, not these aliases.
	vite: {
		resolve: {
			alias: {
				'@vault': vaultDir,
				'@assets': `${vaultDir}/assets`,
			},
		},
	},
	integrations: [
		expressiveCode({
			themes: [spectreDark],
		}),
		mdx(),
		sitemap(),
		spectre({
			name: 'Soumyaranjan Acharya',
			openGraph: {
				blog: {
					title: "Soumyaranjan's Blog",
					description: 'Thoughts, stories and ideas on programming, web development and more.',
				},
			},
		}),
	],
});

export default config;
