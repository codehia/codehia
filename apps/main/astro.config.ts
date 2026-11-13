import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import spectre from '@codehia/spectre';
import { spectreDark } from '@codehia/ui/ec-theme';
import { defineConfig } from 'astro/config';
import expressiveCode from 'astro-expressive-code';

// https://astro.build/config
const config = defineConfig({
	site: 'https://sacharya.dev',
	server: { port: 4321 },
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
