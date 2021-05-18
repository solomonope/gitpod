/**
 * Copyright (c) 2020 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */

export function ownerTokenCookieName(gitpodHost: string, instanceId: string): string {
    let cookiePrefix: string = gitpodHost;
    cookiePrefix = cookiePrefix.replace(/^https?/, '');
    [" ", "-", "."].forEach(c => cookiePrefix = cookiePrefix.split(c).join("_"));

    return `_${cookiePrefix}_ws_${instanceId}_owner_`;
}