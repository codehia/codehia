import type { ImageMetadata } from 'astro';

export interface NavLink {
	label: string;
	href: string;
	active?: boolean;
}

/** Per-page props: what a page passes to its app's Layout, forwarded to the shared one. */
export interface PageProps {
	title: string;
	description?: string;
	image?: ImageMetadata;
	/** Generated title card (`/og/<slug>.png`), used when there is no `image`. */
	ogCard?: string;
	pagefindIgnore?: boolean;
	article?: {
		createdAt: Date;
		updatedAt?: Date;
	};
}
