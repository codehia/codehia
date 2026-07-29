import { fileURLToPath } from 'node:url';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import expressiveCode from 'astro-expressive-code';
import spectre from './package/src';
import { spectreDark } from './src/ec-theme';

// https://astro.build/config
const config = defineConfig({
	site: 'https://sacharya.dev',
	output: 'static',
	// Same @assets alias as the blog app: main reads vault posts for the home
	// "Latest Posts" feed, so it must resolve `image: "@assets/foo.png"` too.
	vite: {
		resolve: {
			alias: {
				'@assets': fileURLToPath(new URL('./vault/assets', import.meta.url)),
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
