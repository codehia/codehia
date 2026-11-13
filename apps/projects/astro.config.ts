import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import spectre from '@codehia/spectre';
import { spectreDark } from '@codehia/ui/ec-theme';
import { defineConfig } from 'astro/config';
import expressiveCode from 'astro-expressive-code';

// https://astro.build/config
const config = defineConfig({
	site: 'https://projects.sacharya.dev',
	server: { port: 4323 },
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
				projects: {
					title: "Soumyaranjan's Projects",
					description: 'Things I have built — CLI tools, services, and experiments.',
				},
			},
		}),
	],
});

export default config;
