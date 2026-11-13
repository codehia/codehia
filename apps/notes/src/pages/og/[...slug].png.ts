import { getCollection } from 'astro:content';
import { ogResponse } from '@codehia/ui/og';
import type { APIRoute, GetStaticPaths } from 'astro';

export const getStaticPaths = (async () => {
	const notes = await getCollection('notes', (note) => note.data.draft !== true);
	return notes.map((note) => ({ params: { slug: note.id }, props: { data: note.data } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) =>
	ogResponse({
		title: props.data.title,
		date: props.data.createdAt,
		tags: props.data.tags,
	});
