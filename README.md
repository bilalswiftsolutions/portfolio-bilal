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

## Deploy on VPS (Nginx) — document root = repo root

This site is static: `index.html` lives at the repo root, so the **entire cloned folder is the public web directory** (no `public/` subfolder).

### 1. Clone on the server

```bash
sudo mkdir -p /var/www
sudo git clone https://github.com/bilalswiftsolutions/portfolio-bilal.git /var/www/portfolio-bilal
sudo chown -R www-data:www-data /var/www/portfolio-bilal
```

### 2. Nginx site config

```bash
sudo nano /etc/nginx/sites-available/bilalarshad.pro
```

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name bilalarshad.pro www.bilalarshad.pro;

    root /var/www/portfolio-bilal;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    location ~* \.(css|js|jpg|jpeg|png|gif|svg|webp|ico|woff2?)$ {
        expires 7d;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
sudo ln -sf /etc/nginx/sites-available/bilalarshad.pro /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### 3. HTTPS (recommended)

```bash
sudo certbot --nginx -d bilalarshad.pro -d www.bilalarshad.pro
```

In Cloudflare, use **Full (strict)** once Certbot is installed.

### 4. Update after changes

```bash
cd /var/www/portfolio-bilal
git pull origin main
```

No build step — `git pull` is enough.

### Cloudflare Pages (alternative)

1. Connect repo `portfolio-bilal`
2. Build command: *(none)*
3. Output directory: `/` (root)

### Nginx example (HTTPS snippet)

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
