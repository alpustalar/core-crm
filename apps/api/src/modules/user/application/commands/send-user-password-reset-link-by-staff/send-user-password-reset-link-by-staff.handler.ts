import { SendUserPasswordResetLinkByStaffCommand } from '@modules/user/application/commands/send-user-password-reset-link-by-staff/send-user-password-reset-link-by-staff.command';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InternalOnly } from '@common/decorators/internal-only.decorator';
import { Inject, NotFoundException } from '@nestjs/common';
import {
  IUserRepository,
  USER_REPO_TOKEN,
} from '@modules/user/domain/repositories/user.repository';
import {
  FIREBASE_SERVICE_TOKEN,
  IFirebaseService,
} from '@modules/firebase/domain/interfaces/firebase.service.interface';
import {
  IPolicyFactory,
  POLICY_FACTORY_TOKEN,
} from '@modules/policy/domain/interfaces/policy-factory.interface';
import {
  IUserEventPublisher,
  USER_EVENT_PUBLISHER_TOKEN,
} from '@modules/user/domain/interfaces/user-event-publisher.interface';
import { LogAction, LogType } from '@src/domain/constants/log-action.constant';

@CommandHandler(SendUserPasswordResetLinkByStaffCommand)
export class SendUserPasswordResetLinkByStaffHandler
  implements ICommandHandler<SendUserPasswordResetLinkByStaffCommand, void>
{
  constructor(
    @Inject(USER_REPO_TOKEN)
    private readonly userRepo: IUserRepository,
    @Inject(FIREBASE_SERVICE_TOKEN)
    private readonly firebaseService: IFirebaseService,
    @Inject(POLICY_FACTORY_TOKEN)
    protected readonly policyFactory: IPolicyFactory,
    @Inject(USER_EVENT_PUBLISHER_TOKEN)
    private readonly userEventPublisher: IUserEventPublisher
  ) {}

  @InternalOnly()
  async execute(command: SendUserPasswordResetLinkByStaffCommand) {
    const {
      context: { actor },
      dto,
    } = command;
    const { evaluator } = this.policyFactory.user(actor);

    evaluator
      .check((p) => p.isTargetInActorsManagedClinic(dto.clinicId))
      .orThrow(() => {
        this.userEventPublisher.sendUserPasswordResetLinkByActor({
          actorId: actor.userId,
          type: LogType.SECURITY,
          source: actor.source,
          action: LogAction.USER_SEND_PASSWORD_RESET_LINK,
        });
      });

    const user = await this.userRepo.findOneWithAnIdOrEmail(dto.userId);

    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }

    await this.firebaseService.generatePasswordResetLink(user.email);
  }
}
