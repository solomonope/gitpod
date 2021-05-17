import { EduEmailDomain } from "@gitpod/gitpod-protocol";

export const EduEmailDomainDB = Symbol('EduEmailDomainDB');
export interface EduEmailDomainDB {
    storeDomainEntry(domain: EduEmailDomain): Promise<void>;

    readEducationalInstitutionDomains(): Promise<EduEmailDomain[]>;
}