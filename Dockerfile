FROM nginx:1.27-alpine

RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY index.html intro.js scene.js bird.js burn.js robots.txt /usr/share/nginx/html/
COPY assets /usr/share/nginx/html/assets
COPY vendor /usr/share/nginx/html/vendor

EXPOSE 80
