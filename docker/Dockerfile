

FROM node:22

RUN npm install -g serve

ADD build /app
ADD docker/entrypoint.sh /app/docker/entrypoint.sh
WORKDIR /app
RUN chown node /app

USER node
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 CMD [ "curl", "-f", "http://localhost:8080/healthcheck.js" ]

ENTRYPOINT ["docker/entrypoint.sh"]
