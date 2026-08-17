import { getCollection } from 'astro:content';
import { renderOgCard } from '@codehia/ui/og';
import type { APIRoute, GetStaticPaths } from 'astro';

export const getStaticPaths = (async () => {
	const notes = await getCollection('notes', (note) => note.data.draft === false);
	return notes.map((note) => ({ params: { slug: note.id }, props: { data: note.data } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) =>
	new Response(
		await renderOgCard({
			title: props.data.title,
			date: props.data.createdAt,
			tags: props.data.tags,
		}),
		{ headers: { 'Content-Type': 'image/png' } }
	);
