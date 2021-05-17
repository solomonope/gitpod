/**
 * Copyright (c) 2020 Gitpod GmbH. All rights reserved.
 * Licensed under the Gitpod Enterprise Source Code License,
 * See License.enterprise.txt in the project root folder.
 */

import { UserService, CheckSignUpParams } from "../../../src/user/user-service";
import { User, WorkspaceTimeoutDuration } from "@gitpod/gitpod-protocol";
import { inject } from "inversify";
import { LicenseEvaluator } from "@gitpod/licensor/lib";
import { Feature } from "@gitpod/licensor/lib/api";
import { AuthException } from "../../../src/auth/errors";

export class UserServiceEE extends UserService {
    @inject(LicenseEvaluator) protected readonly licenseEvaluator: LicenseEvaluator;

    async getDefaultWorkspaceTimeout(user: User, date: Date): Promise<WorkspaceTimeoutDuration> {
        if (!this.licenseEvaluator.isEnabled(Feature.FeatureSetTimeout)) {
            return "30m";
        }

        return "60m";
    }

    async checkSignUp(params: CheckSignUpParams) {
        // 1. check the license
        const userCount = await this.userDb.getUserCount(true);
        if (!this.licenseEvaluator.hasEnoughSeats(userCount)) {
            const msg = `Maximum number of users permitted by the license exceeded`;
            throw AuthException.create("Cannot sign up", msg, { userCount, params });
        }

        // 2. check defaults
        await super.checkSignUp(params);
    }

}




// @injectable()
// export class UserServiceIO extends UserServiceEE {
//     @inject(EligibilityService) protected readonly eligibilityService: EligibilityService;

//     async getDefaultWorkspaceTimeout(user: User, date: Date): Promise<WorkspaceTimeoutDuration> {
//         return this.eligibilityService.getDefaultWorkspaceTimeout(user, date);
//     }

//     async checkSignUp(params: CheckSignUpParams) {
//         // no-op
//     }

//     async checkTermsAcceptanceRequired(params: CheckTermsParams): Promise<boolean> {
//         ///////////////////////////////////////////////////////////////////////////
//         // Currently, we don't check for ToS on login.
//         ///////////////////////////////////////////////////////////////////////////
        
//         return false;
//     }

//     async checkTermsAccepted(user: User) {
//         // called from GitpodServer implementation

//         ///////////////////////////////////////////////////////////////////////////
//         // Currently, we don't check for ToS on Gitpod API calls.
//         ///////////////////////////////////////////////////////////////////////////

//         return true;
//     }

//     protected handleNewUser(newUser: User, isFirstUser: boolean) {
//         if (this.env.blockNewUsers) {
//             newUser.blocked = true;
//         }
//     }

// }