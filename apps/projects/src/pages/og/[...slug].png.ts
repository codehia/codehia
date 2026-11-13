import { getCollection } from 'astro:content';
import { ogResponse } from '@codehia/ui/og';
import type { APIRoute, GetStaticPaths } from 'astro';

export const getStaticPaths = (async () => {
	const projects = await getCollection('projects', (project) => project.data.draft !== true);
	return projects.map((project) => ({
		params: { slug: project.id },
		props: { data: project.data },
	}));
}) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) =>
	ogResponse({ title: props.data.title, date: props.data.date });
