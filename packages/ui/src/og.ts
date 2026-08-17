import { fromRoot } from '@codehia/content';
import sharp from 'sharp';

// `fromRoot`, not a URL relative to this module: Vite rewrites `import.meta.url`
// when it bundles this into an app's SSR build, so relative paths point at dist.
const BACKGROUND = fromRoot('packages/ui/og-background.png');
const SANS_BOLD = fromRoot('packages/ui/fonts/Geist-SemiBold.ttf');
const SANS = fromRoot('packages/ui/fonts/Geist-Regular.ttf');

const WIDTH = 1600;
const HEIGHT = 900;
const PAD = 96;
const GAP = 40;

// pango renders at `dpi`, so at 72 DPI one point == one pixel.
const text = (value: string, font: string, fontfile: string) =>
	sharp({
		text: {
			text: value,
			font,
			fontfile,
			width: WIDTH - PAD * 2,
			rgba: true,
			wrap: 'word',
			align: 'right',
			dpi: 72,
		},
	})
		.png()
		.toBuffer({ resolveWithObject: true });

const escapeMarkup = (s: string) =>
	s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export type OgCard = {
	title: string;
	date: Date;
	tags?: string[];
};

/**
 * Build an article's social card: the shared background with the title (word
 * wrapped) and a date/tags line beneath it, right aligned and vertically
 * centred, all in white.
 * Used as the og:image fallback for published entries with no frontmatter image.
 */
export async function renderOgCard({
	title,
	date,
	tags = [],
}: OgCard): Promise<Uint8Array<ArrayBuffer>> {
	// ponytail: title size stepped by length rather than measured-and-refitted.
	// Swap for a shrink-to-fit loop if a title ever overflows the card.
	const size = title.length > 70 ? 56 : title.length > 40 ? 68 : 80;

	const meta = [
		date.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' }),
		...tags,
	].join('  ·  ');

	const [heading, footer] = await Promise.all([
		text(
			`<span foreground="#ffffff" size="${size}pt" line_height="1.15">${escapeMarkup(title)}</span>`,
			'Geist SemiBold',
			SANS_BOLD
		),
		text(`<span foreground="#ffffff" size="30pt">${escapeMarkup(meta)}</span>`, 'Geist', SANS),
	]);

	// Title + footer as one block, vertically centred and flush to the right
	// margin — the right of the background is its darkest area.
	const blockTop = Math.round((HEIGHT - (heading.info.height + GAP + footer.info.height)) / 2);
	const rightAlign = (width: number) => WIDTH - PAD - width;

	const card = await sharp(BACKGROUND)
		.composite([
			{ input: heading.data, left: rightAlign(heading.info.width), top: blockTop },
			{
				input: footer.data,
				left: rightAlign(footer.info.width),
				top: blockTop + heading.info.height + GAP,
			},
		])
		.png()
		.toBuffer();

	// Copied because sharp types its Buffer as `<ArrayBufferLike>`, which does not
	// satisfy `BodyInit` in a Response. Build-time only, a handful of images.
	return new Uint8Array(card);
}
