# These variables are set to make it convenient to run the docker image locally.
tag = $(shell git rev-parse --abbrev-ref HEAD)
port = 30501
public_url = http://localhost:${port}

image:
	@SDP_TAG=$(tag) SDP_PORT=$(port) SDP_PUBLIC_URL=$(public_url) docker-compose -f docker/docker-compose.yaml build --build-arg REACT_APP_VERSION='$(shell ./generate-commitish.sh)'

up:
	@SDP_TAG=$(tag) SDP_PORT=$(port) SDP_PUBLIC_URL=$(public_url) docker-compose -f docker/docker-compose.yaml up -d
	@echo "Station Data Portal running at $(public_url)"
	@docker logs -f station-data-portal-frontend

down:
	@SDP_TAG=$(tag) SDP_PORT=$(port) SDP_PUBLIC_URL=$(public_url) docker-compose -f docker/docker-compose.yaml down
