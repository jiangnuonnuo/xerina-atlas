FROM nginx:1.30.4-alpine

COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY docs/.vitepress/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/healthz || exit 1
