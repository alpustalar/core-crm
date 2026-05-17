import { UpdateLastLoginHandler } from './update-last-login/update-last-login.handler';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { FirebaseModule } from '@modules/firebase/firebase.module';
import { PolicyModule } from '@modules/policy/policy.module';
import { MailModule } from '@modules/mail/mail.module';
import { ProviderModule } from '@modules/provider/provider.module';
import { USER_REPO_TOKEN } from '@modules/user/domain/repositories/user.repository';
import { USER_EVENT_PUBLISHER_TOKEN } from '@modules/user/domain/interfaces/user-event-publisher.interface';
import { UserRepository } from '@modules/user/infrastructure/persistence/prisma/repositories/user.repository';
import { UserEventPublisher } from '@modules/user/infrastructure/events/user-event-publisher.service';

// Command Handlers
import { ChangePasswordHandler } from './change-password/change-password.handler';
import { ChangeAllUsersStatusInClinicHandler } from '@modules/user/application/commands/change-all-users-status-in-clinic';
import { CreateUserHandler } from './create-user/create-user.handler';
import { SendUserPasswordResetLinkByStaffHandler } from './send-user-password-reset-link-by-staff/send-user-password-reset-link-by-staff.handler';
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
  imports: [CqrsModule, FirebaseModule, PolicyModule, MailModule, ProviderModule],
  providers: [
    ...CommandHandlers,
    { provide: USER_REPO_TOKEN, useClass: UserRepository },
    { provide: USER_EVENT_PUBLISHER_TOKEN, useClass: UserEventPublisher },
  ],
  exports: [...CommandHandlers],
})
export class UserCommandModule {}
