# blog

Markdown posts for the blog page ([`/blog.html`](../blog.html)).

## Adding a post

1. Create a new file in this folder named `YYYY-MM-DD-some-title.md`.
2. Add frontmatter at the top (optional, but recommended):

   ```
   ---
   title: my post title
   date: 2026-06-13
   description: one-line summary shown in the post list
   tag: meta
   ---
   ```

3. Write the body in standard Markdown.
4. Commit & push.

That's it. `blog.html` lists every `.md` file in this folder automatically
(via the GitHub contents API), sorts them newest-first, and renders them in the
site theme when opened. `README.md` is ignored.

## Notes

- If `title` or `date` are missing, they're inferred from the first
  `# heading` and the `YYYY-MM-DD` filename prefix respectively.
- The first `# heading` becomes the post's big title; the rest renders below it.
- `posts.json` is an **optional fallback** — it's only used for local preview
  (opening the site through a local server before pushing) or if the GitHub API
  is ever unavailable. On the live site you normally never need to touch it. If
  you do rely on it locally, keep the filename list in sync.

## Supported Markdown

Headings (`#`–`######`), **bold**, *italic*, ~~strikethrough~~, `inline code`,
fenced ` ``` ` code blocks, unordered/ordered lists, `>` blockquotes,
`[links](url)`, `![images](url)`, GitHub-style tables, and `---` horizontal
rules.
