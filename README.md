# Bilal Arshad — Portfolio

Modern, fast, SEO-optimized portfolio site for **Bilal Arshad**.

- Static HTML/CSS/JS (no build step — excellent Lighthouse scores)
- Mobile-first responsive layout
- JSON-LD Person schema, Open Graph, sitemap, robots.txt
- Highlights full-stack work + AI/LangGraph projects (CineBot)

## Local preview

```bash
cd portfolio-bilal
python3 -m http.server 8080
```

Open http://127.0.0.1:8080

## Deploy (GitHub Pages / Cloudflare Pages / Nginx)

Point the site root to this folder. Set your domain `bilalarshad.pro` in:

- `index.html` canonical + Open Graph URLs
- `sitemap.xml`
- `robots.txt`

### Cloudflare Pages

1. Connect repo `portfolio-bilal`
2. Build command: *(none)*
3. Output directory: `/` (root)

### Nginx example

```nginx
server {
    listen 443 ssl http2;
    server_name bilalarshad.pro www.bilalarshad.pro;
    root /var/www/portfolio-bilal;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## SEO checklist after deploy

1. Submit `https://bilalarshad.pro/sitemap.xml` to Google Search Console
2. Verify structured data: https://search.google.com/test/rich-results
3. Run PageSpeed Insights — target 95+ mobile/desktop
4. Add real LinkedIn URL in `index.html` JSON-LD `sameAs` if different
5. Replace placeholder LinkedIn link if needed

## Title recommendation

Use **"Software Engineer · Full-Stack & AI"** as your headline — not a full pivot to "AI Engineer" only. Your 8+ years are Laravel/Vue/React; AI is your differentiator. On LinkedIn/resume use both keywords for search visibility.
