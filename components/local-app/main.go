// Copyright (c) 2021 Gitpod GmbH. All rights reserved.
// Licensed under the GNU Affero General Public License (AGPL).
// See License-AGPL.txt in the project root for license information.

package main

import (
	_ "embed"

	"context"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"regexp"
	"strconv"
	"strings"

	gitpod "github.com/gitpod-io/gitpod/gitpod-protocol"
	"github.com/gitpod-io/local-app/pkg/auth"
	"github.com/gitpod-io/local-app/pkg/bastion"
	"github.com/gorilla/handlers"
	"github.com/sirupsen/logrus"
	"github.com/urfave/cli/v2"
	"github.com/zalando/go-keyring"
)

var (
	// Version : current version
	Version string = strings.TrimSpace(version)
	//go:embed version.txt
	version string
)

func main() {
	app := cli.App{
		Name:                 "gitpod-local-companion",
		Usage:                "connect your Gitpod workspaces",
		Action:               DefaultCommand("run"),
		EnableBashCompletion: true,
		Version:              Version,
		Flags: []cli.Flag{
			&cli.StringFlag{
				Name:  "gitpod-host",
				Usage: "URL of the Gitpod installation to connect to",
				EnvVars: []string{
					"GITPOD_HOST",
				},
			},
			&cli.BoolFlag{
				Name:  "mock-keyring",
				Usage: "Don't use system native keyring, but store Gitpod token in memory",
			},
		},
		Commands: []*cli.Command{
			{
				Name: "run",
				Action: func(c *cli.Context) error {
					if c.Bool("mock-keyring") {
						keyring.MockInit()
					}
					return run(c.String("gitpod-host"), c.String("ssh_config"))
				},
				Flags: []cli.Flag{
					&cli.PathFlag{
						Name:  "ssh_config",
						Usage: "produce and update an OpenSSH compatible ssh_config file",
						Value: "/tmp/gitpod_ssh_config",
					},
				},
			},
		},
	}
	err := app.Run(os.Args)
	if err != nil {
		log.Fatal(err)
	}
}

func DefaultCommand(name string) cli.ActionFunc {
	return func(ctx *cli.Context) error {
		return ctx.App.Command(name).Run(ctx)
	}
}

func run(host, sshConfig string) error {
	tkn, err := auth.GetToken(host)
	if errors.Is(err, keyring.ErrNotFound) {
		tkn, err = auth.Login(context.Background(), auth.LoginOpts{GitpodURL: host})
	}
	if err != nil {
		return err
	}

	domainRegex := strings.ReplaceAll(host, ".", "\\.")
	originRegex, err := regexp.Compile(".*" + domainRegex)
	// TODO(ak) exclude subdomains for 3rd party content, like port location, minibrowser, webviews, and so on
	if err != nil {
		return err
	}

	cb := bastion.CompositeCallbacks{
		&logCallbacks{},
	}
	if sshConfig != "" {
		cb = append(cb, &bastion.SSHConfigWritingCallback{Path: sshConfig})
	}

	var b *bastion.Bastion

	wshost := host
	wshost = strings.ReplaceAll(wshost, "https://", "wss://")
	wshost = strings.ReplaceAll(wshost, "http://", "ws://")
	wshost += "/api/v1"
	client, err := gitpod.ConnectToServer(wshost, gitpod.ConnectToServerOpts{
		Context: context.Background(),
		Token:   tkn,
		Log:     logrus.NewEntry(logrus.New()),
		ReconnectionHandler: func() {
			if b != nil {
				b.FullUpdate()
			}
		},
	})
	if err != nil {
		return err
	}

	b = bastion.New(client, cb)
	go http.ListenAndServe("localhost:5000", handlers.CORS(
		handlers.AllowedOriginValidator(func(origin string) bool {
			// Is the origin a subdomain of the installations hostname?
			matches := originRegex.Match([]byte(origin))
			return matches
		}),
		handlers.AllowedOrigins([]string{host}),
		handlers.AllowedMethods([]string{
			"GET",
			"OPTIONS",
		}),
		handlers.MaxAge(60),
		handlers.OptionStatusCode(200),
	)(http.HandlerFunc(func(rw http.ResponseWriter, r *http.Request) {
		segs := strings.Split(r.URL.Path, "/")
		if len(segs) < 3 {
			http.Error(rw, "invalid URL Path", http.StatusBadRequest)
			return
		}
		worksapceID := segs[1]
		port, err := strconv.Atoi(segs[2])
		if err != nil {
			http.Error(rw, err.Error(), http.StatusBadRequest)
			return
		}
		localAddr, err := b.GetTunnelLocalAddr(worksapceID, uint32(port))
		if err != nil {
			http.Error(rw, err.Error(), http.StatusNotFound)
			return
		}
		fmt.Fprintf(rw, localAddr)
	})))
	return b.Run()
}

type logCallbacks struct{}

func (*logCallbacks) InstanceUpdate(w *bastion.Workspace) {
	logrus.WithField("workspace", w).Info("instance update")
}
