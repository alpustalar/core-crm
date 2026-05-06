import { Module } from '@nestjs/common';

import {
  ChangePasswordUseCase,
  CreateUserUseCase,
  FindAllUsersUseCase,
  FindOneWithUserIdOrEmailUseCase,
  SendUserPasswordResetLinkByActorUseCase,
  SendVerificationEmailUseCase,
  SoftDeleteManyUserForCascadeUseCase,
  SoftDeleteManyUserByOrganizationIdUseCase,
  SoftDeleteUserByActorUseCase,
  UpdateUserByActorUseCase,
  UpdateUserBySelfUseCase,
} from '../index';
import { MailModule } from '@modules/mail/mail.module';
import { UserRepository } from '@modules/user/infrastructure/persistence/prisma/repositories/user.repository';
import { PolicyFactory } from '@modules/policy/policy-factory';
import { ContextService } from '@src/infrastructure/persistence/prisma/context.service';
import { SendUserPasswordResetLinkBySelfUseCase } from '@modules/user/application/use-cases/commands/send-user-password-reset-link-by-self';

const UseCases = [
  SendUserPasswordResetLinkByActorUseCase,
  SendVerificationEmailUseCase,
  SoftDeleteUserByActorUseCase,
  UpdateUserBySelfUseCase,
  UpdateUserByActorUseCase,
  FindOneWithUserIdOrEmailUseCase,
  FindAllUsersUseCase,
  CreateUserUseCase,
  ChangePasswordUseCase,
  SoftDeleteManyUserForCascadeUseCase,
  SoftDeleteManyUserByOrganizationIdUseCase,
  SendUserPasswordResetLinkBySelfUseCase,
];

@Module({
  imports: [MailModule],
  providers: [...UseCases, UserRepository, PolicyFactory, ContextService],
  exports: [...UseCases],
})
export class UserUseCaseModule {}
