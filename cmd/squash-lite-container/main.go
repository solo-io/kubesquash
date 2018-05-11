package main

import (
	log "github.com/sirupsen/logrus"
	"github.com/solo-io/squash-lite/pkg/kube"
)

func main() {
	err := kube.Debug()
	if err != nil {
		log.WithField("err", err).Fatal("debug failed!")

	}
}
