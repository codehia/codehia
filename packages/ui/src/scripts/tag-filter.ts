// Tag filter for the blog/notes index pages: clicking a `.blog-tag` toggles it,
// hides every `.post-container` card that lacks a selected tag (cards list their
// tags in `data-tags`), and mirrors the selection into `?tags=a,b`.
const tags = document.querySelectorAll<HTMLAnchorElement>('.blog-tag');
const cards = document.querySelectorAll<HTMLAnchorElement>('.post-container');
const url = new URL(window.location.href);
const initialTags =
	url.searchParams
		.get('tags')
		?.split(',')
		.filter((tag) => tag.length > 0) || [];
const selectedTags = new Set(initialTags);

function updateVisibility() {
	cards.forEach((card) => {
		const cardTags = card.dataset.tags!.split(',');
		// if there are selected tags and the card does not have all of them, hide it
		if (selectedTags.size > 0 && ![...selectedTags].every((tag) => cardTags.includes(tag))) {
			card.style.display = 'none';
		} else {
			card.style.display = '';
		}
	});
}

function updateURL() {
	// create a "clean" URL for the current page before adding the new query parameters
	const newUrl = new URL(window.location.pathname, window.location.origin);
	if (selectedTags.size > 0) {
		newUrl.searchParams.set('tags', [...selectedTags].join(','));
	}
	history.pushState({ tags: [...selectedTags] }, '', newUrl);
}

tags.forEach((tag) => {
	const tagValue = tag.dataset.tag!;
	if (selectedTags.has(tagValue)) {
		tag.classList.add('active');
	}

	tag.addEventListener('click', (event) => {
		event.preventDefault();

		tag.classList.toggle('active');

		if (selectedTags.has(tagValue)) {
			selectedTags.delete(tagValue);
		} else {
			selectedTags.add(tagValue);
		}

		updateVisibility();
		updateURL();
	});
});

updateVisibility();
