<h1 align="center">
    <img src="/images/KubeSquash.png" alt="squash" width="216" height="248">
  <br>
  Debugger for Kubernetes
</h1>


<h4 align="center">Debug your microservices application running on Kubernetes</h4>
<BR>


## What is it?
A squash version with just a command line client and NO server to deploy.

Right now squash lite only works for kubernetes, debugging go programs using dlv.

## Prerequisites
- Kubernetes 1.10+ cluster with ability to run privileged containers (such as `minikube`).
- `kubectl` configured to your cluster.
- And obviously some go program to debug.

## How to use it?

Download the binary, and then just run it!
You will be asked to input the pod you wish to debug. You will then be presented with a command line dlv prompt.

## Status
This is a very initial version of squash lite. We released it early to get community feedback.
Currently it works debugging `go` microservices from mac and linux. 
You can also try `gdb`, if you are adventurous.

# Future plans:

- VSCode integration
- More debuggers (python, java..)
- Better Skaffold integration (autodetect more settings)

# To Use
Grab squash lite from our releases page:

https://github.com/solo-io/squash-lite/releases

The first time it runs takes longer as it needs to download a container containing the debugger.

# How to Build

Build binary and container:
```
make DOCKER_REPO=your-docker-repo
``` 

Push containers to docker hub:
make DOCKER_REPO=your-docker-repo push-containers