# Aerval — hero concept

Static site rebuilt from the single-file mock-up. No build step, no framework: plain HTML, CSS and JavaScript, ready for GitHub Pages.

```
.
├── index.html            page markup
├── 404.html              shown by GitHub Pages for unknown URLs
├── css/styles.css        design tokens and all styles
├── js/main.js            nav inversion, hotspot cards, count-up, reveals
├── assets/
│   ├── favicon.svg
│   ├── engine.jpg        ← add (see step 1)
│   └── hero-texture.png  ← add (see step 1)
├── tools/extract-images.py
└── .nojekyll             tells Pages to serve files as-is
```

## 1. Add the two images

The mock-up embedded its images as base64. Pull them out of the original file:

```bash
python3 tools/extract-images.py path/to/original-mockup.html
```

Optional: convert `engine.jpg` to WebP (or run it through Squoosh) to cut page weight, then update the two references in `index.html`.

## 2. Preview locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## 3. Publish on GitHub Pages

1. Create a repository and push these files to the `main` branch.
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, branch `main`, folder `/ (root)`, then save.
4. After a minute the site is live at `https://<user-or-org>.github.io/<repo>/`.

## 4. Use your own domain

1. **Verify the domain first** (prevents anyone else claiming it on Pages): profile or org **Settings → Pages → Add a domain**, then add the TXT record GitHub shows you at your DNS provider.
2. In the repo's **Settings → Pages → Custom domain**, enter the domain and save. GitHub commits a `CNAME` file to the repo.
3. At your DNS provider, add the records below.
4. Once the DNS check passes, tick **Enforce HTTPS** (the certificate can take up to an hour).

**Subdomain** (e.g. `www.example.com` or `mockup.example.com`):

| Type  | Name  | Value                     |
|-------|-------|---------------------------|
| CNAME | `www` | `<user-or-org>.github.io` |

**Apex / root domain** (e.g. `example.com`):

| Type | Name | Value             |
|------|------|-------------------|
| A    | `@`  | `185.199.108.153` |
| A    | `@`  | `185.199.109.153` |
| A    | `@`  | `185.199.110.153` |
| A    | `@`  | `185.199.111.153` |
| AAAA | `@`  | `2606:50c0:8000::153` |
| AAAA | `@`  | `2606:50c0:8001::153` |
| AAAA | `@`  | `2606:50c0:8002::153` |
| AAAA | `@`  | `2606:50c0:8003::153` |

Using the apex? Also add the `www` CNAME above; GitHub redirects between the two automatically.

Reference: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site

## Before going public

- Remove the `robots` noindex tag in `index.html` (and `404.html`).
- Fill in `og:url` and `og:image` in `index.html` and add `assets/og-image.jpg` (1200×630).
- The nav links to `#why`, `#features`, `#how` and `#demo` point at sections that aren't built yet.
