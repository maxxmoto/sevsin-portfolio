FROM nginx:1.27-alpine

RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY index.html scene.js bird.js burn.js robots.txt sitemap.xml llms.txt ai-catalog.json logo-224.webp logo-448.webp logo-672.webp logo-448.png /usr/share/nginx/html/
COPY favicon.svg favicon.ico favicon-16x16.png favicon-32x32.png apple-touch-icon.png icon-192.png icon-512.png safari-pinned-tab.svg og-image.png site.webmanifest browserconfig.xml mstile-150x150.png mstile-310x310.png /usr/share/nginx/html/
COPY assets /usr/share/nginx/html/assets
COPY .well-known /usr/share/nginx/html/.well-known
COPY vendor /usr/share/nginx/html/vendor

EXPOSE 80
