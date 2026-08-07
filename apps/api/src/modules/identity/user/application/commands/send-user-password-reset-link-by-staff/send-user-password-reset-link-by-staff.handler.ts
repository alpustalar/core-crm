import { SendUserPasswordResetLinkByStaffCommand } from '@modules/identity/user/application/commands/send-user-password-reset-link-by-staff/send-user-password-reset-link-by-staff.command';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  IUserQueryRepository,
  USER_QUERY_REPOSITORY,
} from '@modules/identity/user/domain/repositories/user.repository';
import {
  FIREBASE_SERVICE,
  IFirebaseService,
} from '@src/infrastructure/firebase/firebase.service.interface';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { SendUserPasswordResetLinkByStaffResponse } from '@modules/identity/user/application/commands/send-user-password-reset-link-by-staff/send-user-password-reset-link-by-staff.response';
import { USER_EVENTS } from '@src/domain/constants/events';
import { UserNotFoundException } from '@modules/identity/user/domain/exceptions/user.exceptions';

@CommandHandler(SendUserPasswordResetLinkByStaffCommand)
export class SendUserPasswordResetLinkByStaffHandler
  implements
    ICommandHandler<
      SendUserPasswordResetLinkByStaffCommand,
      SendUserPasswordResetLinkByStaffResponse
    >
{
  constructor(
    @Inject(USER_QUERY_REPOSITORY)
    private readonly userRepo: IUserQueryRepository,
    @Inject(FIREBASE_SERVICE)
    private readonly firebaseService: IFirebaseService,
    @Inject(POLICY_FACTORY)
    protected readonly policyFactory: IPolicyFactory
  ) {}

  async execute(
    command: SendUserPasswordResetLinkByStaffCommand
  ): Promise<SendUserPasswordResetLinkByStaffResponse> {
    const { ctx, data } = command;

    this.policyFactory
      .user(ctx.actor, ctx.source)
      .evaluator.check((p) => p.isTargetInActorsManagedClinic(data.clinicId))
      .orThrow(USER_EVENTS.SEND_PASSWORD_RESET_LINK_BY_STAFF);

    // Salt okunur ön-kontrol: yerel bir mutasyonu belirlemiyor (yalnız Firebase'e
    // gidecek e-posta adresi okunuyor) → Query Repo burada meşru.
    const user = await this.userRepo.findByIdOrEmail(data.userId);

    if (!user) throw new UserNotFoundException();

    await this.firebaseService.generatePasswordResetLink(user.email);
  }
}
