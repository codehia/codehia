# Migration Checklist

Resumable, phase-by-phase. `[x]` done, `[ ]` to do. Work happens on branch **`monorepo`** (live `master` stays safe).

---

## Locked decisions (context)

- Hosting: **Cloudflare Pages**. DNS: **Cloudflare** (moved from Namecheap).
- Subdomains: `sacharya.dev` (home/about/work), `blog.`, `notes.`, `projects.`, `resume.` (redirect), `contact.` (punted).
- Content: **one Obsidian vault = plain folders in the monorepo** (`blog/ notes/ projects/`, NO `vault/` prefix, **no submodule**). Obsidian opens them; Obsidian **Git** commits+pushes the monorepo → CF build. Files are `.md`. Make the whole monorepo **private** (published notes are public as rendered pages regardless). Submodule only if code must be public while notes private — rejected as too complex.
- Monorepo: `apps/{site,blog,notes,projects}` + `packages/{ui,manifest}` + `package/` (Spectre, shared) + content folders `blog/ notes/ projects/`.
- Wikilinks: `@flowershow/remark-wiki-link`, `permalinks` map = cross-subdomain manifest. `buildManifest()` scans ALL content folders; each app renders one folder but scans all. **No note-transclusion** (`![[note]]`) for now; plain `[[ ]]` links + media embeds only.
- Truly-private notes: `draft: true`, or a folder no app builds, or `.gitignore` a folder (local only).
- Routes: catch-all `[...slug].astro`; drop `/blog` `/projects` path prefixes (subdomain = the section).
- Projects: `projects.sacharya.dev/<name>` = README doc; demo link inline; path-based (no per-project subdomains).
- Notes: same schema as blog; index grouped **by folder**; draft + tags enforced.
- Cross-app URLs: **env-aware** via `site-urls.ts` (no hardcoded prod).
- Dedupe strategy: **B** (copy shared into blog now, extract `packages/ui` later).

---

## Phase 0 — GitHub Pages → Cloudflare Pages (the live single site)

- [x] Lower DNS TTL at Namecheap.
- [x] Add site to Cloudflare; verify imported records.
- [x] Move Namecheap nameservers → Cloudflare.
- [x] Delete GitHub Pages apex `A` records in CF DNS (kept Tutanota email records).
- [x] Create CF Pages project, attach `sacharya.dev`, confirm `server: cloudflare` + `cf-ray`.
- [ ] **Teardown GitHub Pages** (only now that CF is confirmed serving):
  - [ ] Delete `CNAME` file, push.
  - [ ] Delete/disable `.github/workflows/deploy.yml`.
  - [ ] Repo Settings → Pages → Source → None.
- [ ] Watch CF hold steady a day or two, then discard the noted GitHub IPs.

Rollback if broken: re-add GitHub `A` records `185.199.108-111.153`, restore `CNAME` file + Pages source. (TTL is low.)

---

> **⚠ Frozen code:** root `src/pages/blog.astro` + `src/pages/blog/[post].astro` are now COPIED into `apps/blog`. All future blog edits go in `apps/blog` — root copies are dead code walking, deleted in Phase 7 with the rest of root `src/`.

## Phase 1 — Monorepo scaffold + blog app

- [x] `pnpm-workspace.yaml`: add `apps/*`, `packages/*`.
- [x] `package/src/integration.ts`: make `openGraph.home/blog/projects` optional.
- [x] Create `apps/blog` (name `@codehia/blog`), copy shared src (strategy B).
- [x] Trim `content.config.ts` to posts + tags; remove projects/home content.
- [x] Pages: `index.astro` (from `blog.astro`) + `[...post].astro` (from `blog/[post].astro`); fix `../../`→`../` imports; hrefs `/blog`→`/`.
- [x] Copy `public/` (fonts) into the app.
- [x] `apps/blog/src/site-urls.ts` + Navbar env-aware URLs; pin dev port 4322.
- [x] `pnpm --filter @codehia/blog build` succeeds (index + non-draft post; drafts excluded).
- [ ] `pnpm --filter @codehia/blog dev` — click through nav + a post locally.

---

## Phase 2 — Deploy blog to Cloudflare (staging first)

### How to: create the CF Pages project

1. CF dashboard → **Workers & Pages → Create → Pages → Connect to Git**.
2. Select `codehia/codehia` repo → "Begin setup".
3. **Project name:** `codehia-blog` (staging URL becomes `<branch>.codehia-blog.pages.dev`).
4. **Production branch:** `monorepo` (change to `master` when promoting to prod).
5. **Framework preset:** None.
6. **Build settings:**
   - Root directory: `apps/blog`
   - Build command: `pnpm build`
   - Build output directory: `dist`
7. **Environment variables (before first build):** `NODE_VERSION` = `22` (run `node -v` locally; strip the `v` prefix).
8. "Save and Deploy". First build runs.

First deploy URL: `monorepo.codehia-blog.pages.dev`.

---

### How to: set `PUBLIC_URL_*` env vars

Dashboard → `codehia-blog` project → Settings → Environment variables.

**Production scope:**

| Variable | Value |
|---|---|
| `PUBLIC_URL_MAIN` | `https://sacharya.dev` |
| `PUBLIC_URL_BLOG` | `https://blog.sacharya.dev` |
| `PUBLIC_URL_PROJECTS` | `https://projects.sacharya.dev` |
| `PUBLIC_URL_NOTES` | `https://notes.sacharya.dev` |

**Preview scope** (staging — used on all non-production branch deploys):

| Variable | Value |
|---|---|
| `PUBLIC_URL_MAIN` | `https://monorepo.codehia-site.pages.dev` |
| `PUBLIC_URL_BLOG` | `https://monorepo.codehia-blog.pages.dev` |
| `PUBLIC_URL_PROJECTS` | `https://monorepo.codehia-projects.pages.dev` |
| `PUBLIC_URL_NOTES` | `https://monorepo.codehia-notes.pages.dev` |

`PUBLIC_URL_MAIN` on Preview = whatever the staging URL of `apps/site` will be (or the current root site preview URL, if the root CF Pages project also deploys the monorepo branch). Unset env vars fall back to `localhost:*` defaults from `site-urls.ts`.

After setting vars: retry the deployment (dashboard → Manage Deployments → Retry) or push a commit.

---

### How to: disable search indexing on Preview (optional)

1. Dashboard → `codehia-blog` → Settings → Environment variables → **Preview scope** → add `PUBLIC_NOINDEX` = `true`.
2. In `apps/blog/src/layouts/Layout.astro` inside `<head>`:

```astro
{import.meta.env.PUBLIC_NOINDEX === 'true' && <meta name="robots" content="noindex" />}
```

---

### Checklist

- [ ] Create CF Pages project `codehia-blog` (steps above).
- [ ] Confirm first build passes; open `monorepo.codehia-blog.pages.dev`.
- [ ] Set `PUBLIC_URL_*` Production + Preview env vars; redeploy.
- [ ] Verify nav links on staging go to staging URLs (not `localhost:*` or prod).
- [ ] (Optional) Add `PUBLIC_NOINDEX` + `<meta>` tag to keep staging out of search.
- [ ] Attach custom domain `blog.sacharya.dev` — **do this last, when promoting to prod**.

---

## Phase 3 — Vault + wikilinks (blog)

Vault delivery DECIDED: plain folders in the monorepo, no submodule.

- [ ] Create `blog/` (repo root) with `.md` posts (move current `.mdx` → `.md`, adjust frontmatter).
- [ ] Point blog loader `base` → `../../blog` (content folder at repo root).
- [ ] Finish `packages/manifest` `buildManifest()` (scan ALL content folders `blog/ notes/ projects/` → `{ files, permalinks }`, absolute subdomain URLs). Handle: unknown folder, drafts, index files.
- [ ] Add `@flowershow/remark-wiki-link` + `fast-glob`; wire `markdown.remarkPlugins` with `{ format: 'shortestPossible', files, permalinks }`.
- [ ] Test `[[post]]`, `[[projects/x]]`, `[[x|alias]]` resolve correctly.
- [ ] Make monorepo private; set up Obsidian Git → push monorepo → CF auto-build (one device only).

---

## Phase 4 — Notes app

- [ ] Create `apps/notes` (mirror blog), name `@codehia/notes`, site `notes.sacharya.dev`, dev port 4324.
- [ ] Schema = blog schema; loader `base` → `../../vault/notes`.
- [ ] Index grouped by top folder; route `[...note].astro` (no series card).
- [ ] draft + tags enforced.
- [ ] Nav env URLs + `site-urls.ts`.
- [ ] Build + staging deploy + custom domain `notes.sacharya.dev`.

---

## Phase 5 — packages/ui dedupe (the B cleanup)

- [ ] Create `packages/ui` (name `@codehia/ui`), move shared components/layout/styles/scripts/ec-theme out of the blog copy.
- [ ] Update blog (and notes) imports to `@codehia/ui/...`.
- [ ] Consolidate `site-urls.ts` into a shared package.
- [ ] Rebuild all apps.

---

## Phase 6 — Projects app

- [ ] Create `apps/projects`, site `projects.sacharya.dev`, dev port 4323.
- [ ] Index = cards (name + description) → `projects.sacharya.dev/<name>`.
- [ ] `[...project].astro` renders README from `vault/projects/<name>.md`; demo link inline.
- [ ] Build + staging + custom domain.

---

## Phase 7 — Site app (home/about/work) + resume + contact

- [ ] Move root portfolio (home, about, work, 404) into `apps/site`; use `packages/ui`.
- [ ] Repoint root CF Pages project to `apps/site`.
- [ ] `resume.sacharya.dev` → redirect to existing resume PDF (CF redirect rule).
- [ ] `contact.sacharya.dev` — punted; decide later.
- [ ] Retire the old root `src/` once `apps/site` is live.

---

## Cutover discipline (every phase)

1. Build locally (`pnpm --filter <app> build`).
2. Deploy to a **preview** branch URL first; verify.
3. Only attach the real custom domain after the preview looks right.
4. Keep `master` deployable at all times; merge only verified work.
