import { getCollection } from 'astro:content';
import { renderOgCard } from '@codehia/ui/og';
import type { APIRoute, GetStaticPaths } from 'astro';

export const getStaticPaths = (async () => {
	const projects = await getCollection('projects', (project) => project.data.draft === false);
	return projects.map((project) => ({
		params: { slug: project.id },
		props: { data: project.data },
	}));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) =>
	new Response(await renderOgCard({ title: props.data.title, date: props.data.date }), {
		headers: { 'Content-Type': 'image/png' },
	});
