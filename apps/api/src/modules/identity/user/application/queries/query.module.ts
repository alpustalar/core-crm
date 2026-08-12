import { FindUserForAuthHandler } from './find-user-for-auth/find-user-for-auth.handler';
import { Module } from '@nestjs/common';

import { CheckEmailExistsHandler } from './check-email-exists/check-email-exists.handler';
import { FindAllUsersForManagerHandler } from '@modules/identity/user/application/queries/find-all-users-for-manager';
import { FindOneWithIdOrEmailHandler } from '@modules/identity/user/application/queries/find-one-with-id-or-email';
import { FindClinicStaffUserIdsHandler } from '@modules/identity/user/application/queries/find-clinic-staff-user-ids/find-clinic-staff-user-ids.handler';
import { UserRepositoriesModule } from '@modules/identity/user/infrastructure/persistence/prisma/repositories/repositories.module';
import { GetUserCapabilitiesHandler } from './get-user-capabilities/get-user-capabilities.handler';

const QueryHandlers = [
  FindUserForAuthHandler,
  CheckEmailExistsHandler,
  FindAllUsersForManagerHandler,
  FindOneWithIdOrEmailHandler,
  FindClinicStaffUserIdsHandler,
  GetUserCapabilitiesHandler,
];

@Module({
  imports: [UserRepositoriesModule],
  providers: [...QueryHandlers],
})
export class UserQueryModule {}
