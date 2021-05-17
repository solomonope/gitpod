import { injectable, inject } from "inversify";
import { EntityManager, Repository } from "typeorm";

import { EduEmailDomain } from "@gitpod/gitpod-protocol";
import { TypeORMEE } from "./typeorm";
import { EduEmailDomainDB } from "../edu-email-domain-db";
import { DBEduEmailDomain } from "./entity/db-edu-email-domain";

@injectable()
export class EduEmailDomainDBImpl implements EduEmailDomainDB {

    @inject(TypeORMEE) typeorm: TypeORMEE;

    protected async getManager(): Promise<EntityManager> {
        return (await this.typeorm.getConnection()).manager;
    }

    protected async getRepo(): Promise<Repository<EduEmailDomain>> {
        return await (await this.getManager()).getRepository<DBEduEmailDomain>(DBEduEmailDomain);
    }

    async storeDomainEntry(entry: EduEmailDomain): Promise<void> {
        const repo = await this.getRepo();
        await repo.save(entry);
    }

    async readEducationalInstitutionDomains(): Promise<EduEmailDomain[]> {
        const repo = await this.getRepo();
        const result = await repo.createQueryBuilder("entry")
            .getMany();
        return result;
    }
}