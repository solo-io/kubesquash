<h1 align="center">
    <img src="/images/KubeSquash.png" alt="squash" width="285" height="248">
</h1>

<h4 align="center">Debug your application running on Kubernetes</h4>
<BR>


## What is it?


KubeSquash is a tool for live debugging of microservices running on Kubernetes.
By attaching modern debuggers to your microservices application, KubeSquash gives you the full strength of live debugging : getting/setting the value of variables, adding pauses and sleeps in certain portions of the code, forcing the execution of specific code paths, etc.

KubeSquash is extremely easy to launch, and requires _No server_. Its user interface is dead simple: invoke with a single command `ksquash`, target the desired pod, and the debugging session is initiated automatically with zero configuration or effort.

You can use KubeSquash  from the command line, or use  Visual Studio Code as its user interface by installing the [KubeCode extension](https://marketplace.visualstudio.com/items?itemName=ilevine.kubesquash).


Right now KubeSquash supports debugging using either gdb or dlv. 

## Prerequisites
- Kubernetes 1.10+ cluster with ability to run privileged containers (such as `minikube`).
- `kubectl` configured to your cluster.

# Road map
- More debuggers (python, java..)
- Enhanced Skaffold integration (autodetect more settings)

# To Use
Download KubeSquash from [here](https://github.com/solo-io/kubesquash/releases), and simply run it.
The first time it runs takes longer, as it needs to download a container containing the debugger.

# How to Build

Build binary and container:
```
make DOCKER_REPO=your-docker-repo
``` 

Push containers to docker hub:
```
make DOCKER_REPO=your-docker-repo push-containers
```
