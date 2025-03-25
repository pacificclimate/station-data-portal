# These variables are set to make it convenient to run the docker image locally.
# Tag will save the image with 
tag = $(shell git rev-parse --abbrev-ref HEAD)
port = 30503

image:
	@npm run build
	@SDP_TAG=$(tag) SDP_PORT=$(port) docker compose -f docker/docker-compose.yaml build

up:
	@SDP_TAG=$(tag) SDP_PORT=$(port) docker compose -f docker/docker-compose.yaml up --force-recreate
	@echo "Station Data Portal running on $(port)"
	@docker logs -f station-data-portal-frontend

down:
	@SDP_TAG=$(tag) SDP_PORT=$(port) docker compose -f docker/docker-compose.yaml down
