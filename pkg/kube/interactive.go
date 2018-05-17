package kube

import (
	"os/exec"
	"syscall"

	"github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
)

func startInteractive(cfg Config, pid int) error {

	dbgInfo := debuggers[cfg.Debugger]
	if dbgInfo == nil {
		return errors.New("unknown debugger")
	}

	// exec into dlv
	log.WithField("pid", pid).Info("attaching with " + cfg.Debugger)
	fullpath, err := exec.LookPath(cfg.Debugger)
	if err != nil {
		return err
	}
	err = syscall.Exec(fullpath, append([]string{fullpath}, dbgInfo.CmdlineGen(pid)...), nil)
	log.WithField("err", err).Info("exec failed!")

	return errors.New("can't start " + cfg.Debugger)
}
