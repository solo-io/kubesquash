.PHONY: all
all: binaries containers

.PHONY: binaries
binaries:target/squash-lite-container/squash-lite-container target/squash-lite

.PHONY: containers
containers: target/squash-lite-container-dlv-container target/squash-lite-container-gdb-container 

.PHONY: push-containers
push-containers: target/squash-lite-container-dlv-pushed target/squash-lite-container-gdb-pushed

DOCKER_REPO ?= soloio
VERSION ?= $(shell git describe --tags)


SRCS=$(shell find ./pkg -name "*.go") $(shell find ./cmd -name "*.go")

target:
	[ -d $@ ] || mkdir -p $@

target/squash-lite: target $(SRCS)
	go build -ldflags "-X github.com/solo-io/squash-lite/pkg/cmd.ImageVersion=$(VERSION) -X github.com/solo-io/squash-lite/pkg/cmd.ImageRepo=$(DOCKER_REPO)" -o $@ ./cmd/squash-lite

target/squash-lite-osx: target $(SRCS)
	GOOS=darwin go build -ldflags "-X github.com/solo-io/squash-lite/pkg/cmd.ImageVersion=$(VERSION) -X github.com/solo-io/squash-lite/pkg/cmd.ImageRepo=$(DOCKER_REPO)" -o $@ ./cmd/squash-lite

target/squash-lite-linux: target $(SRCS)
	GOOS=linux go build -ldflags "-X github.com/solo-io/squash-lite/pkg/cmd.ImageVersion=$(VERSION) -X github.com/solo-io/squash-lite/pkg/cmd.ImageRepo=$(DOCKER_REPO)" -o $@ ./cmd/squash-lite

target/squash-lite-container/:
	[ -d $@ ] || mkdir -p $@

target/squash-lite-container/squash-lite-container: | target/squash-lite-container/
target/squash-lite-container/squash-lite-container: $(SRCS)
	GOOS=linux CGO_ENABLED=0  go build -ldflags '-w' -o ./target/squash-lite-container/squash-lite-container ./cmd/squash-lite-container/


target/squash-lite-container/Dockerfile.dlv:    | target/squash-lite-container/
target/squash-lite-container/Dockerfile.dlv: cmd/squash-lite-container/Dockerfile.dlv
	cp cmd/squash-lite-container/Dockerfile.dlv target/squash-lite-container/Dockerfile.dlv
target/squash-lite-container-dlv-container: ./target/squash-lite-container/squash-lite-container target/squash-lite-container/Dockerfile.dlv
	docker build -f target/squash-lite-container/Dockerfile.dlv -t $(DOCKER_REPO)/squash-lite-container-dlv:$(VERSION) ./target/squash-lite-container/
	touch $@
target/squash-lite-container-dlv-pushed: target/squash-lite-container-dlv-container
	docker push $(DOCKER_REPO)/squash-lite-container-dlv:$(VERSION)
	touch $@



target/squash-lite-container/Dockerfile.gdb:    | target/squash-lite-container/
target/squash-lite-container/Dockerfile.gdb: cmd/squash-lite-container/Dockerfile.gdb
	cp cmd/squash-lite-container/Dockerfile.gdb target/squash-lite-container/Dockerfile.gdb
target/squash-lite-container-gdb-container: ./target/squash-lite-container/squash-lite-container target/squash-lite-container/Dockerfile.gdb
	docker build -f target/squash-lite-container/Dockerfile.gdb -t $(DOCKER_REPO)/squash-lite-container-gdb:$(VERSION) ./target/squash-lite-container/
	touch $@
target/squash-lite-container-gdb-pushed: target/squash-lite-container-gdb-container
	docker push $(DOCKER_REPO)/squash-lite-container-gdb:$(VERSION)
	touch $@



.PHONY: clean
clean:
	rm -rf target

dist: target/squash-lite-container-gdb-pushed target/squash-lite-container-dlv-pushed