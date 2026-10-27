FROM nginxinc/nginx-unprivileged:1.30.5-trixie

# The base image runs as nginx (101); switch to root only to patch OS packages.
USER root
RUN apt-get update && \
    apt-get upgrade -y && \
    rm -rf /var/lib/apt/lists/*
USER 101

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --chmod=755 docker/set-base-path.sh /docker-entrypoint.d/40-set-base-path.sh
COPY --chown=nginx:nginx dist /app

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 CMD [ "curl", "-f", "http://localhost:8080/healthcheck.js" ]
