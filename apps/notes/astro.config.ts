import { fileURLToPath } from 'node:url';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import spectre from '@codehia/spectre';
import { spectreDark } from '@codehia/ui/ec-theme';
import { defineConfig } from 'astro/config';
import expressiveCode from 'astro-expressive-code';

// Private Obsidian vault, cloned to <repo>/vault at build time.
const vaultDir = fileURLToPath(new URL('../../vault', import.meta.url));

// https://astro.build/config
const config = defineConfig({
	site: 'https://notes.sacharya.dev',
	server: { port: 4324 },
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
				notes: {
					title: "Soumyaranjan's Notes",
					description: 'Notes, references and things worth remembering.',
				},
			},
		}),
	],
});

export default config;
