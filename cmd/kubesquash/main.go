package main

import (
	"flag"
	"fmt"
	"os"

	"github.com/solo-io/kubesquash/pkg/cmd"
)

const descriptionUsage = `Normally KubeSquash requires no arguments. Just run it!
It works by creating additional privileged debug pod and then attaching to it.

IMPORTANT:
  * Kubernetes with CRI is needed - see https://kubernetes.io/docs/setup/cri/.
  * Due to a technical limitation, KubeSquash doesn't support scratch images at the moment (KubeSquash relies on the 'ls' command present in the image).
`

var KubeSquashVersion string

func main() {
	var cfg cmd.SquashConfig
	flag.Usage = func() {
		fmt.Fprintf(flag.CommandLine.Output(), "Usage of %s:\n", os.Args[0])
		fmt.Fprintf(flag.CommandLine.Output(), "%s\n", descriptionUsage)
		flag.PrintDefaults()
	}

	flag.BoolVar(&cfg.NoClean, "no-clean", false, "don't clean temporary pod when existing")
	flag.BoolVar(&cfg.ChooseDebugger, "no-guess-debugger", false, "don't auto detect debugger to use")
	flag.BoolVar(&cfg.ChoosePod, "no-guess-pod", false, "don't auto detect pod to use")
	flag.BoolVar(&cfg.NoDetectSkaffold, "no-detect-pod", false, "don't auto settings based on skaffold configuration present in current folder")
	flag.BoolVar(&cfg.DebugServer, "debug-server", false, "start a debug server instead of an interactive session")
	flag.IntVar(&cfg.TimeoutSeconds, "timeout", 300, "timeout in seconds to wait for debug pod to be ready")
	flag.StringVar(&cfg.DebugContainerVersion, "container-version", cmd.ImageVersion, "debug container version to use")
	flag.StringVar(&cfg.DebugContainerRepo, "container-repo", cmd.ImageRepo, "debug container repo to use")

	flag.BoolVar(&cfg.Machine, "machine", false, "machine mode input and output")
	flag.StringVar(&cfg.Debugger, "debugger", "", "Debugger to use")
	flag.StringVar(&cfg.ServiceAccount, "sa", "", "Service account to use for the kubesquash pod")
	flag.StringVar(&cfg.Namespace, "namespace", "", "Namespace to debug")
	flag.StringVar(&cfg.Pod, "pod", "", "Pod to debug")
	flag.StringVar(&cfg.Container, "container", "", "Container to debug")
	flag.StringVar(&cfg.CRISock, "crisock", "/var/run/dockershim.sock", "The path to the CRI socket")

	version := flag.Bool("version", false, "prints current app version")

	flag.Parse()

	if *version {
		fmt.Println(KubeSquashVersion)
		os.Exit(0)
	}

	err := cmd.StartDebugContainer(cfg)
	if err != nil {
		fmt.Println(err)
		os.Exit(-1)
	}
}
