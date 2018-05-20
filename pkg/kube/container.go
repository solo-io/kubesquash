package kube

import (
	"fmt"

	squashkube "github.com/solo-io/squash/pkg/platforms/kubernetes"
)

type DebuggerInfo struct {
	CmdlineGen func(int) []string
}

var debuggers map[string]*DebuggerInfo
var debuggerServer map[string]*DebuggerInfo

const DebuggerPort = "1235"
const OutPort = "1236"
const ListenHost = "127.0.0.1"

func init() {
	debuggers = make(map[string]*DebuggerInfo)
	debuggers["dlv"] = &DebuggerInfo{CmdlineGen: func(pid int) []string {
		return []string{"attach", fmt.Sprintf("%d", pid)}
	}}

	debuggers["gdb"] = &DebuggerInfo{CmdlineGen: func(pid int) []string {
		return []string{"-p", fmt.Sprintf("%d", pid)}
	}}
	debuggerServer = make(map[string]*DebuggerInfo)
	debuggerServer["dlv"] = &DebuggerInfo{CmdlineGen: func(pid int) []string {
		return []string{"attach", fmt.Sprintf("%d", pid), "--listen=127.0.0.1:" + DebuggerPort, "--headless", "--log"}
	}}
}

func Debug() error {
	cfg := GetConfig()

	containerProcess := squashkube.NewContainerProcess()
	info, err := containerProcess.GetContainerInfoKube(nil, &cfg.Attachment)
	if err != nil {
		return err
	}

	pid := info.Pids[0]

	if cfg.Server {
		return startServer(cfg, pid)

	} else {
		return startInteractive(cfg, pid)
	}

}
