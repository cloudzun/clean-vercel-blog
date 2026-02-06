Tailwind Migration — Article Body (Phase 1)
=========================================

Goal
----
Migrate the article body (`.prose` content in `app/layout.js`/page templates) to Tailwind-first styling in small, reversible steps. This branch will only touch article/content container styles and provide visual diffs for each step.

Plan (Phase 1)
--------------
1. Create a dedicated class `article-tailwind` and apply it to the article container in `app/layout.js` (only for testing on this branch).
2. Add a small Tailwind-based stylesheet that maps the most important typography styles (font-size, line-height, headings, paragraph spacing).
3. Generate visual diffs vs current baseline using the `visual-check` tool.
4. Iterate: expand to lists, code blocks, images.

Risks & mitigations
--------------------
- Risk: visual regressions — Mitigate: use `visual-check` after each small commit.
- Risk: breaking dark mode styles — Mitigate: include dark-mode Tailwind variants in the per-component stylesheet.

Files changed in follow-ups
--------------------------
- `app/layout.js` (apply `article-tailwind` class locally on this branch)
- `styles/article-tailwind.css` (Tailwind-first mapping)

Next actions I will take on this branch:
1. Create branch `tailwind-article-body`.
2. Add this file and push the branch.  
3. Implement step 1 (add `article-tailwind` class) and generate a visual diff.
