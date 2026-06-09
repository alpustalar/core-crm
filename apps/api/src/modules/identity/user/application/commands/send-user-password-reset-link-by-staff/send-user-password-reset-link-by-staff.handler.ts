import { SendUserPasswordResetLinkByStaffCommand } from '@modules/identity/user/application/commands/send-user-password-reset-link-by-staff/send-user-password-reset-link-by-staff.command';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import {
  IUserQueryRepository,
  USER_QUERY_REPOSITORY,
} from '@modules/identity/user/domain/repositories/user.repository';
import {
  FIREBASE_SERVICE,
  IFirebaseService,
} from '@modules/identity/auth/firebase/domain/interfaces/firebase.service.interface';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/domain/interfaces/policy-factory.interface';
import {
  IUserEventPublisher,
  USER_EVENT_PUBLISHER,
} from '@modules/identity/user/domain/interfaces/user-event-publisher.interface';
import { SendUserPasswordResetLinkByStaffResponse } from '@modules/identity/user/application/commands/send-user-password-reset-link-by-staff/send-user-password-reset-link-by-staff.response';
import { USER_EVENTS } from '@src/domain/constants/events';

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
    protected readonly policyFactory: IPolicyFactory,
    @Inject(USER_EVENT_PUBLISHER)
    private readonly userEventPublisher: IUserEventPublisher
  ) {}

  async execute(
    command: SendUserPasswordResetLinkByStaffCommand
  ): Promise<SendUserPasswordResetLinkByStaffResponse> {
    const {
      ctx: { actor },
      dto,
    } = command;
    const { evaluator } = this.policyFactory.user(actor);

    evaluator
      .check((p) => p.isTargetInActorsManagedClinic(dto.clinicId))
      .orThrow(USER_EVENTS.SEND_PASSWORD_RESET_LINK_BY_STAFF);

    const user = await this.userRepo.findByIdOrEmail(dto.userId);

    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }

    await this.firebaseService.generatePasswordResetLink(user.email);
  }
}
