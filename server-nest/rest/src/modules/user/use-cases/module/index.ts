import { forwardRef, Module } from '@nestjs/common';

import {
  ChangePasswordUseCase,
  CreateUserUseCase,
  FindAllUsersUseCase,
  FindOneWithUserIdOrEmailUseCase,
  SendUserPasswordResetLinkByActorUseCase,
  SendVerificationEmailUseCase,
  SoftDeleteManyUserForCascadeUseCase,
  SoftDeleteUserByActorUseCase,
  UpdateUserByActorUseCase,
  UpdateUserBySelfUseCase,
} from '../index';
import { UserModule } from '@modules/user/user.module';
import { MailModule } from '@modules/mail/mail.module';
import { UserRepository } from '@modules/user/repositories/user.repository';
import { PolicyFactory } from '@common/policy/factory.policy';

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
];

@Module({
  imports: [forwardRef(() => UserModule), MailModule],
  providers: [...UseCases, UserRepository, PolicyFactory],
  exports: [...UseCases, UserRepository],
})
export class UserUseCaseModule {}
