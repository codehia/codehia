/**
 * Estimates the time it takes to read an article in minutes based on:
 * - A reading speed of 200 words per minute
 * - 10 seconds per image
 * - 20 seconds per code block
 *
 * @param body The raw Markdown body of the article
 */
export function timeToRead(body = ''): number {
	const numWords = body
		// keep a link's text, drop its URL: `[text](url)` -> `text`
		.replace(/!?\[(.*?)\]\(.*?\)/g, '$1')
		.replace(/```.*?```/gms, '')
		.split(/\s+/).length;

	const numImages = body.match(/!\[/g)?.length || 0;
	const numCodeblocks = body.match(/```/g)?.length || 0;

	return Math.ceil(numWords / 200) + Math.ceil(numImages / 6) + Math.ceil(numCodeblocks / 3);
}

interface SeriesMember {
	id: string;
	data: { title?: string; series?: string; seriesPart?: number };
}

export interface Series {
	name: string;
	entries: { id: string; title?: string; current: boolean }[];
}

/** The series `entry` belongs to, ordered by `seriesPart` — or undefined if it has none. */
export function seriesFor<T extends SeriesMember>(all: T[], entry: T): Series | undefined {
	const name = entry.data.series;
	if (!name) return undefined;
	return {
		name,
		entries: all
			.filter((e) => e.data.series === name)
			.sort((a, b) => (a.data.seriesPart ?? 0) - (b.data.seriesPart ?? 0))
			.map((e) => ({ id: e.id, title: e.data.title, current: e.id === entry.id })),
	};
}
