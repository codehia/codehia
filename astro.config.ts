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
					title: 'Soumyaranjan',
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
			// for comments (Can enable later)
			giscus: false,
		}),
	],
});

export default config;
