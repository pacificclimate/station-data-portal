# These variables are set to make it convenient to run the docker image locally.
tag = $(shell git rev-parse --abbrev-ref HEAD)
port = 30503
public_url = http://localhost:${port}

image:
	@npm run build
	@SDP_TAG=$(tag) SDP_PORT=$(port) docker compose -f docker/docker-compose.yaml build --build-arg REACT_APP_APP_VERSION='$(shell ./generate-commitish.sh)'

up:
	@SDP_TAG=$(tag) SDP_PORT=$(port) docker compose -f docker/docker-compose.yaml up --force-recreate
	@echo "Station Data Portal running on $(port)"
	@docker logs -f station-data-portal-frontend

down:
	@SDP_TAG=$(tag) SDP_PORT=$(port) docker compose -f docker/docker-compose.yaml down
