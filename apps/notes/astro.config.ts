import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import spectre from '@codehia/spectre';
import { spectreDark } from '@codehia/ui/ec-theme';
import { defineConfig } from 'astro/config';
import expressiveCode from 'astro-expressive-code';

// https://astro.build/config
const config = defineConfig({
	site: 'https://notes.sacharya.dev',
	server: { port: 4324 },
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
				notes: {
					title: "Soumyaranjan's Notes",
					description: 'Notes, references and things worth remembering.',
				},
			},
		}),
	],
});

export default config;
