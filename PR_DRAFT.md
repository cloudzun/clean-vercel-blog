Title: Import Hugo theme CSS/assets and add highlighting + verification screenshots

Summary
-------
This branch imports the compiled CSS and static assets from the local Hugo `hugo-paper` theme into the Next.js site, fixes asset paths and CSS variable mismatches, and initializes syntax highlighting on article pages. It also includes verification screenshots for visual review.

What changed
------------
- Added `public/hugo-paper-main.css`, `public/hugo-paper-app.css` and theme assets (icons, theme.svg, highlight.min.js).
- Imported theme CSS in `app/globals.css` and synced CSS variables (`--background` / `--bg`).
- Fixed absolute asset paths to `'/theme.svg'` in CSS and layout.
- Loaded `highlight.min.js` in `app/layout.js` and initialized `hljs.highlightAll()` (afterInteractive).
- Moved markdown files into `content/posts/`.
- Added verification screenshots in `screenshots/`.

Why this PR is safe
--------------------
- Changes are additive: theme assets live in `public/` and are imported via `globals.css`.
- No removal of existing files beyond moving content into `content/posts/`.
- Syntax highlighting is loaded after page interactive; it is opt-in and non-blocking.

How to review locally
---------------------
1. Checkout this branch:

```bash
git fetch origin
git checkout -b theme-import-pr origin/theme-import-pr || git checkout theme-import-pr
```

2. Install and run dev server:

```bash
npm install
npm run dev
# open http://localhost:3000/ and a post page to visually inspect
```

3. Visual verification: see `screenshots/home.png` and `screenshots/post.png` for the baseline visual result included in the PR.

Suggested next steps (after merging)
-----------------------------------
- Add automated visual regression (Puppeteer/Playwright + pixelmatch) to catch regressions before merges.
- Gradually migrate theme rules to Tailwind-first on a separate feature branch (per-component, with visual diffs).

Notes
-----
If you want I can open the PR on GitHub using the `gh` CLI or the web UI; I can also create an automated visual-check script and run it here if you prefer.
