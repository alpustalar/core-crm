import { FindUserForAuthHandler } from './find-user-for-auth/find-user-for-auth.handler';
import { Module } from '@nestjs/common';
import { PolicyModule } from '@modules/platform/policy/policy.module';
import { POLICY_FACTORY } from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { PolicyFactory } from '@modules/platform/policy/staff/application/policy-factory';
import { UserRepositoryModule } from '@modules/identity/user/infrastructure/persistence/prisma/repositories/user.repository.module';

import { CheckEmailExistsHandler } from './check-email-exists/check-email-exists.handler';
import { FindAllUsersForManagerHandler } from '@modules/identity/user/application/queries/find-all-users-for-manager';
import { FindOneWithIdOrEmailHandler } from '@modules/identity/user/application/queries/find-one-with-id-or-email';

const QueryHandlers = [
  FindUserForAuthHandler,
  CheckEmailExistsHandler,
  FindAllUsersForManagerHandler,
  FindOneWithIdOrEmailHandler,
];

@Module({
  imports: [PolicyModule, UserRepositoryModule],
  providers: [
    ...QueryHandlers,
    { provide: POLICY_FACTORY, useClass: PolicyFactory },
  ],
  exports: [...QueryHandlers],
})
export class UserQueryModule {}
