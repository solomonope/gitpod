/**
 * Copyright (c) 2020 Gitpod GmbH. All rights reserved.
 * Licensed under the Gitpod Enterprise Source Code License,
 * See License.enterprise.txt in the project root folder.
 */

import { RepositoryService } from "../../../src/repohost/repo-service";
import { inject, injectable } from "inversify";
import { Env } from "../../../src/env";
import { User } from "@gitpod/gitpod-protocol";

@injectable()
export class GitHubService extends RepositoryService {
    @inject(Env) protected env: Env;

    async canAccessHeadlessLogs(user: User): Promise<boolean> {
        return false;
    }
}