# alexanderduckworthhu.github.io

Personal data-science portfolio — live at **https://alexanderduckworthhu.github.io**.

## Stack

Hand-written HTML/CSS/JS, no build step, no dependencies. The "More on GitHub"
section is populated live from the public GitHub API, so new public repos
appear automatically.

## Editing

- Featured case studies: edit `index.html` directly.
- Colors and layout tokens: `:root` variables at the top of `styles.css`.
- Repos excluded from the auto-fetched grid: the `FEATURED` set in `script.js`.
- LinkedIn link: uncomment the placeholder in the About section of `index.html`.

## Local preview

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy

Pushed to `main` → served by GitHub Pages automatically.
