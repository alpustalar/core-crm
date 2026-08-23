import { UpdateLastLoginHandler } from './update-last-login/update-last-login.handler';
import { EnqueueForceDeleteUserHandler } from './enqueue-force-delete-user/enqueue-force-delete-user.handler';
import { Module } from '@nestjs/common';
import { ProviderModule } from '@modules/clinical/provider/provider.module';

// Command Handlers
import { ChangePasswordHandler } from './change-password/change-password.handler';
import { ChangeAllUsersStatusInClinicHandler } from '@modules/identity/user/application/commands/change-all-users-status-in-clinic';
import { CreateUserHandler } from './create-user/create-user.handler';
import { SendUserPasswordResetLinkByStaffHandler } from '@modules/identity/user/application/commands/send-user-password-reset-link-by-staff';
import { SendUserPasswordResetLinkBySelfHandler } from '@modules/identity/user/application/commands/send-user-password-reset-link-by-self';
import { SendVerificationEmailHandler } from './send-verification-email/send-verification-email.handler';

import { SoftDeleteManyUsersByOrganizationIdHandler } from './soft-delete-many-user-by-organization-id/soft-delete-many-users-by-organization-id.handler';
import { SoftDeleteUserByStaffHandler } from '@modules/identity/user/application/commands/soft-delete-user-by-staff';
import { UpdateUserByStaffHandler } from './update-user-by-staff/update-user-by-staff.handler';
import { UpdateUserBySelfHandler } from './update-user-by-self/update-user-by-self.handler';
import { SoftDeleteManyUsersByClinicIdHandler } from '@modules/identity/user/application/commands/soft-delete-many-user-by-clinic-id/soft-delete-many-users-by-clinic-id.handler';
import { MailModule } from '@src/infrastructure/mail/mail.module';
import { UserInfrastructureModule } from '@modules/identity/user/infrastructure/infrastructure.module';
import { GrantUserCapabilityHandler } from './grant-user-capability/grant-user-capability.handler';
import { RevokeUserCapabilityHandler } from './revoke-user-capability/revoke-user-capability.handler';

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

  EnqueueForceDeleteUserHandler,
  GrantUserCapabilityHandler,
  RevokeUserCapabilityHandler,
];

@Module({
  imports: [MailModule, ProviderModule, UserInfrastructureModule],
  providers: [...CommandHandlers],
})
export class UserCommandModule {}
