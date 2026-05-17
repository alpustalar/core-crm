import { FindUserForAuthHandler } from './find-user-for-auth/find-user-for-auth.handler';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PolicyModule } from '@modules/policy/policy.module';
import { USER_REPO_TOKEN } from '@modules/user/domain/repositories/user.repository';
import { POLICY_FACTORY_TOKEN } from '@modules/policy/domain/interfaces/policy-factory.interface';
import { UserRepository } from '@modules/user/infrastructure/persistence/prisma/repositories/user.repository';
import { PolicyFactory } from '@modules/policy/application/policy-factory';

import { CheckEmailExistsHandler } from './check-email-exists/check-email-exists.handler';
import { FindAllUsersForManagerHandler } from '@modules/user/application/queries/find-all-users-for-manager';
import { FindOneWithIdOrEmailHandler } from '@modules/user/application/queries/find-one-with-id-or-email';

const QueryHandlers = [
  FindUserForAuthHandler,
  CheckEmailExistsHandler,
  FindAllUsersForManagerHandler,
  FindOneWithIdOrEmailHandler,
];

@Module({
  imports: [CqrsModule, PolicyModule],
  providers: [
    ...QueryHandlers,
    { provide: USER_REPO_TOKEN, useClass: UserRepository },
    { provide: POLICY_FACTORY_TOKEN, useClass: PolicyFactory },
  ],
  exports: [...QueryHandlers],
})
export class UserQueryModule {}
