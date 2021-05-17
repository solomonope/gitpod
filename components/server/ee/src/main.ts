/**
 * Copyright (c) 2020 Gitpod GmbH. All rights reserved.
 * Licensed under the Gitpod Enterprise Source Code License,
 * See License.enterprise.txt in the project root folder.
 */

import { start } from "../../src/init";
import { log } from "@gitpod/gitpod-protocol/lib/util/logging";
import { Container } from "inversify";
import { productionContainerModule } from "../../src/container-module";
import { productionEEContainerModule } from "./container-module";
import { dbContainerModuleEE } from "@gitpod/gitpod-db/lib/ee/src/container-module";

const container = new Container();
container.load(productionContainerModule);
container.load(productionEEContainerModule);
container.load(dbContainerModuleEE);

start(container)
    .catch(err => {
        log.error("Error during startup or operation. Exiting.", err);
        process.exit(1);
    });
