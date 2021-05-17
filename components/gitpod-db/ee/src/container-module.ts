import { ContainerModule } from 'inversify';
import { AccountingDB } from './accounting-db';
import { TeamSubscriptionDB } from './team-subscription-db';
import { TypeORMAccountingDBImpl } from './typeorm/accounting-db-impl';
import { TeamSubscriptionDBImpl } from './typeorm/team-subscription-db-impl';
import { TypeORMEE } from './typeorm/typeorm';
import { EMailDB } from './email-db';
import { TypeORMEMailDBImpl } from './typeorm/email-db-impl';
import { LicenseDB, TypeORM } from '../../src';
import { EmailDomainFilterDB } from './email-domain-filter-db';
import { EmailDomainFilterDBImpl } from './typeorm/email-domain-filter-db-impl';
import { EduEmailDomainDB } from './edu-email-domain-db';
import { EduEmailDomainDBImpl } from './typeorm/edu-email-domain-db-impl';
import { LicenseDBImpl } from '../../src/typeorm/license-db-impl';

// THE DB container module that contains all DB implementations
export const dbContainerModuleEE = new ContainerModule((bind, unbind, isBound, rebind) => {
    bind(TypeORMEE).toSelf().inSingletonScope();
    rebind(TypeORM).to(TypeORMEE);

    bind(AccountingDB).to(TypeORMAccountingDBImpl).inSingletonScope();
    bind(TeamSubscriptionDB).to(TeamSubscriptionDBImpl).inSingletonScope();
    bind(EmailDomainFilterDB).to(EmailDomainFilterDBImpl).inSingletonScope();
    bind(EduEmailDomainDB).to(EduEmailDomainDBImpl).inSingletonScope();
    bind(EMailDB).to(TypeORMEMailDBImpl).inSingletonScope();
    bind(LicenseDB).to(LicenseDBImpl).inSingletonScope();
});
