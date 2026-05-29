import { UpdateLastLoginHandler } from './update-last-login/update-last-login.handler';
import { Module } from '@nestjs/common';
import { FirebaseModule } from '@modules/firebase/firebase.module';
import { PolicyModule } from '@modules/policy/policy.module';
import { MailModule } from '@modules/mail/mail.module';
import { ProviderModule } from '@modules/provider/provider.module';
import { RedisModule } from '@common/redis/redis.module';
import { USER_EVENT_PUBLISHER } from '@modules/user/domain/interfaces/user-event-publisher.interface';
import { UserEventPublisher } from '@modules/user/infrastructure/events/user-event-publisher.service';
import { UserRepositoryModule } from '@modules/user/infrastructure/persistence/prisma/repositories/user.repository.module';

// Command Handlers
import { ChangePasswordHandler } from './change-password/change-password.handler';
import { ChangeAllUsersStatusInClinicHandler } from '@modules/user/application/commands/change-all-users-status-in-clinic';
import { CreateUserHandler } from './create-user/create-user.handler';
import { SendUserPasswordResetLinkByStaffHandler } from '@modules/user/application/commands/send-user-password-reset-link-by-staff';
import { SendUserPasswordResetLinkBySelfHandler } from '@modules/user/application/commands/send-user-password-reset-link-by-self';
import { SendVerificationEmailHandler } from './send-verification-email/send-verification-email.handler';

import { SoftDeleteManyUsersByOrganizationIdHandler } from './soft-delete-many-user-by-organization-id/soft-delete-many-users-by-organization-id.handler';
import { SoftDeleteUserByStaffHandler } from '@modules/user/application/commands/soft-delete-user-by-staff';
import { UpdateUserByStaffHandler } from './update-user-by-staff/update-user-by-staff.handler';
import { UpdateUserBySelfHandler } from './update-user-by-self/update-user-by-self.handler';
import { SoftDeleteManyUsersByClinicIdHandler } from '@modules/user/application/commands/soft-delete-many-user-by-clinic-id/soft-delete-many-users-by-clinic-id.handler';

const CommandHandlers = [
  UpdateLastLoginHandler,
  ChangePasswordHandler,
  ChangeAllUsersStatusInClinicHandler,
  CreateUserHandler,
  SendUserPasswordResetLinkByStaffHandler,
  SendUserPasswordResetLinkBySelfHandler,
  SendVerificationEmailHandler,
  SoftDeleteManyUsersByClinicIdHandler,
  SoftDeleteManyUsersByOrganizationIdHandler,
  SoftDeleteUserByStaffHandler,
  UpdateUserByStaffHandler,
  UpdateUserBySelfHandler,
];

@Module({
  imports: [
    FirebaseModule,
    PolicyModule,
    MailModule,
    ProviderModule,
    RedisModule,
    UserRepositoryModule,
  ],
  providers: [
    ...CommandHandlers,
    { provide: USER_EVENT_PUBLISHER, useClass: UserEventPublisher },
  ],
  exports: [...CommandHandlers],
})
export class UserCommandModule {}
