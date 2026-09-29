FROM node:24-bookworm-slim

RUN apt-get -y update &&  \
    apt-get install --no-install-recommends  \
    -y curl && \
    rm -rf /var/lib/apt/lists/*

RUN npm install --global npm@12 && \
    test "$(node --version | cut -d. -f1 | tr -d v)" = "24" && \
    test "$(npm --version | cut -d. -f1)" = "12" && \
    npm install --global serve@14.2.6

COPY --chown=node dist /app
COPY --chown=node docker/entrypoint.sh docker/set-base-path.mjs /app/docker/
WORKDIR /app

USER node
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 CMD [ "curl", "-f", "http://localhost:8080/healthcheck.js" ]

ENTRYPOINT ["docker/entrypoint.sh"]
