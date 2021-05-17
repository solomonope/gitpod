import { EmailDomainFilterEntry } from "@gitpod/gitpod-protocol";

export const EmailDomainFilterDB = Symbol('EmailDomainFilterDB');
export interface EmailDomainFilterDB {
    storeFilterEntry(entry: EmailDomainFilterEntry): Promise<void>;

    filter(emailDomain: string): Promise<boolean>;
}