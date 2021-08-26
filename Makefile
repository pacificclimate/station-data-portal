tag = $(shell git rev-parse --abbrev-ref HEAD)

image:
	SDP_TAG=$(tag) SDP_PORT=$(port) SDP_PUBLIC_URL=$(public_url) docker-compose -f docker/docker-compose.yaml build --build-arg REACT_APP_VERSION='$(shell ./generate-commitish.sh)'

port = 30501
public_url = http://localhost:${port}

up:
	@SDP_TAG=$(tag) SDP_PORT=$(port) SDP_PUBLIC_URL=$(public_url) docker-compose -f docker/docker-compose.yaml up -d
	@echo "Station Data Portal running at $(public_url)"

down:
	@SDP_TAG=$(tag) SDP_PORT=$(port) SDP_PUBLIC_URL=$(public_url) docker-compose -f docker/docker-compose.yaml down
