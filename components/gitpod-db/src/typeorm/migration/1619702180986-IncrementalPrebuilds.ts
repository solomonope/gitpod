/**
 * Copyright (c) 2021 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */

import { MigrationInterface, QueryRunner } from "typeorm";
import { columnExists } from "./helper/helper";

export class IncrementalPrebuilds1619702180986 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        if (!(await columnExists(queryRunner, "d_b_prebuilt_workspace", "parentPrebuildId"))) {
            await queryRunner.query("ALTER TABLE d_b_prebuilt_workspace ADD COLUMN parentPrebuildId char(36) NULL");
        }
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
    }

}
