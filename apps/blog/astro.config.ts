import { fileURLToPath } from 'node:url';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import expressiveCode from 'astro-expressive-code';
import spectre from '../../package/src';
import { spectreDark } from './src/ec-theme';

// https://astro.build/config
const config = defineConfig({
	site: 'https://blog.sacharya.dev',
	server: { port: 4322 },
	output: 'static',
	// Depth-proof alias for vault images: frontmatter `image: "@assets/foo.png"`
	// and Obsidian body embeds resolve here regardless of note nesting depth.
	vite: {
		resolve: {
			alias: {
				'@assets': fileURLToPath(new URL('../../vault/assets', import.meta.url)),
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
