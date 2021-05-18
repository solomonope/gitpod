/**
 * Copyright (c) 2020 Gitpod GmbH. All rights reserved.
 * Licensed under the Gitpod Enterprise Source Code License,
 * See License.enterprise.txt in the project root folder.
 */

import { RepositoryService } from "../../../src/repohost/repo-service";
import { inject, injectable } from "inversify";
import { Env } from "../../../src/env";
import { CommitContext, User, WorkspaceContext } from "@gitpod/gitpod-protocol";
import { GitHubGraphQlEndpoint } from "../../../src/github/api";

@injectable()
export class GitHubService extends RepositoryService {
    @inject(Env) protected env: Env;
    @inject(GitHubGraphQlEndpoint) protected readonly githubQueryApi: GitHubGraphQlEndpoint;

    async canAccessHeadlessLogs(user: User, context: WorkspaceContext): Promise<boolean> {
        if (!CommitContext.is(context)) {
            return false;
        }

        const result: any = await this.githubQueryApi.runQuery(user, `
            query {
                repository(name: "${context.repository.name}", owner: "${context.repository.owner}", viewerPermission: "READ") {
                }
            }
        `);
        return result.data.repository !== null;
    }
}