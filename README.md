# Notebook (Astro)

Personal site and blog built with Astro.

## Stack

- Astro 5
- Markdown content collections
- GitHub Pages deployment via GitHub Actions

## Local development

```bash
npm install
npm run dev
```

Build static site:

```bash
ASTRO_TELEMETRY_DISABLED=1 npm run build
```

## Content

- Blog notes: `src/content/blog/*.md`
- Project pages: `src/content/project/*.md`
- Project listing data: `src/data/projects.json`
- Shared styles: `src/styles/global.css`

## Deployment (GitHub Pages)

This repo deploys using `.github/workflows/deploy.yml`.

1. Go to `Settings -> Pages` in GitHub.
2. Set `Source` to `GitHub Actions`.
3. Push to `master`.
4. Wait for the `Deploy Astro to GitHub Pages` workflow to finish.

If deployment is not updating, check the `Actions` tab for build errors.
