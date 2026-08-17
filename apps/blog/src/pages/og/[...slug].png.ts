import { getCollection } from 'astro:content';
import { renderOgCard } from '@codehia/ui/og';
import type { APIRoute, GetStaticPaths } from 'astro';

export const getStaticPaths = (async () => {
	const posts = await getCollection('posts', (post) => post.data.draft === false);
	return posts.map((post) => ({ params: { slug: post.id }, props: { data: post.data } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) =>
	new Response(
		await renderOgCard({
			title: props.data.title,
			date: props.data.createdAt,
			tags: props.data.tags?.map((tag: { id: string }) => tag.id),
		}),
		{ headers: { 'Content-Type': 'image/png' } }
	);
