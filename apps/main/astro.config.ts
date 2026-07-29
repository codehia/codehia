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
	site: 'https://sacharya.dev',
	output: 'static',
	// Vite aliases for vault imports (e.g. `image: "@assets/foo.png"` in posts).
	// NOTE: these work for module/asset imports only — content-loader `base`
	// paths in content.config.ts do NOT go through Vite aliases.
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
				home: {
					title: 'Soumyaranjan Acharya',
					description: 'Soumyaranjan Personal Portfolio',
				},
				blog: {
					title: "Soumyaranjan's Blog",
					description: 'Thoughts, stories and ideas on programming, web development and more.',
				},
				projects: {
					title: "Soumyaranjan's Projects",
				},
			},
		}),
	],
});

export default config;
