# Copilot Instructions for Portfolio (civil-corot)

## Project Overview

This is an **Astro 5** portfolio site using the "Spectre" theme—a terminal-inspired, zero-framework theme. The main application lives in `civil-corot/`.

## Architecture

### Custom Spectre Integration (`package/`)
The theme uses a **custom Astro integration** that provides global configuration via Vite virtual modules:

- Configuration defined in `astro.config.ts` → `spectre({ name, openGraph, giscus })`
- Accessed anywhere via `import { name, themeColor, giscus } from 'spectre:globals'`
- Options validated with Zod in [package/src/integration.ts](civil-corot/package/src/integration.ts)

### Content Collections (`src/content/`)
All content uses Astro's content collections with typed schemas in [src/content.config.ts](civil-corot/src/content.config.ts):

| Collection | Source | Purpose |
|------------|--------|---------|
| `posts` | `posts/*.mdx` | Blog posts with `title`, `createdAt`, `tags`, `image`, `draft` |
| `projects` | `projects/*.mdx` | Project showcases with `title`, `date`, `image`, `info[]` |
| `other` | `other/*.mdx` | Static pages (e.g., about) |
| `quickInfo`, `socials`, `workExperience`, `tags` | JSON files | Structured data |

### Icon System
Icons use `@iconify-json/lucide` and `@iconify-json/simple-icons`. Usage pattern in content/components:
```ts
{ type: 'lucide', name: 'github' }  // or 'simple-icons'
```
The `Icon.astro` component renders these dynamically.

## Key Commands

```bash
cd civil-corot
pnpm dev          # Start dev server
pnpm build        # Build (runs pagefind postbuild for search)
pnpm lint         # Biome check
pnpm lint:fix     # Biome auto-fix
```

## Code Style (Biome)

- **Single quotes** for JS/TS strings
- **Tabs** for JSON indentation
- **100 character** line width
- **LF** line endings
- ES5 trailing commas

## Content Conventions

### Blog Posts (`src/content/posts/*.mdx`)
```yaml
---
title: "Post Title"
description: "Brief description"
image: "../assets/image.png"  # Required, relative to content folder
createdAt: MM-DD-YYYY          # Date format
updatedAt: MM-DD-YYYY          # Optional
draft: false                   # Set true to exclude from build
tags:
  - guide                      # Must exist in tags.json
---
```

### Projects (`src/content/projects/*.mdx`)
```yaml
---
title: Project Name
date: MM-DD-YYYY
description: Brief description
image: ../assets/image.png
info:
  - text: GitHub
    link: https://github.com/...
    icon: { type: lucide, name: github }
---
```

### JSON Data Files
- `info.json` - Profile quick facts (displayed on homepage)
- `socials.json` - Social links with icons
- `work.json` - Work experience entries
- `tags.json` - Valid tag IDs for posts

## Component Patterns

- **Layout**: All pages use `Layout.astro` with named slots (`left`, `right`, `404`)
- **Cards**: Wrap content sections in `Card.astro`
- **Images**: Use `ImageGlow.astro` for images with glow effect
- **Icons**: Use `Icon.astro` with `type` and `name` props

## Environment Variables

Giscus comments require these env vars (see `astro.config.ts`):
- `GISCUS_REPO`, `GISCUS_REPO_ID`, `GISCUS_CATEGORY`, `GISCUS_CATEGORY_ID`
- `GISCUS_MAPPING`, `GISCUS_STRICT`, `GISCUS_REACTIONS_ENABLED`, `GISCUS_EMIT_METADATA`, `GISCUS_LANG`

Set `giscus: false` in the integration config to disable comments entirely.

## Static Output

The site builds to static HTML (`output: 'static'` in Astro config). Pagefind generates search indexes at `dist/client` during postbuild.
