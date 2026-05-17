import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SoftDeleteUserByStaffCommand } from '@modules/user/application/commands/soft-delete-user-by-staff/soft-delete-user-by-staff.command';
import { Inject } from '@nestjs/common';
import {
  IUserRepository,
  USER_REPO_TOKEN,
} from '@modules/user/domain/repositories/user.repository';
import {
  IPolicyFactory,
  POLICY_FACTORY_TOKEN,
} from '@modules/policy/domain/interfaces/policy-factory.interface';
import {
  IUserEventPublisher,
  USER_EVENT_PUBLISHER_TOKEN,
} from '@modules/user/domain/interfaces/user-event-publisher.interface';
import { ExecutionPolicy } from '@src/domain/common/execution/execution.policy';

@CommandHandler(SoftDeleteUserByStaffCommand)
export class SoftDeleteUserByStaffHandler
  implements ICommandHandler<SoftDeleteUserByStaffCommand, void>
{
  constructor(
    @Inject(USER_REPO_TOKEN)
    private readonly userRepo: IUserRepository,
    @Inject(POLICY_FACTORY_TOKEN)
    private readonly policyFactory: IPolicyFactory,
    @Inject(USER_EVENT_PUBLISHER_TOKEN)
    private readonly userEventPublisher: IUserEventPublisher
  ) {}

  async execute(command: SoftDeleteUserByStaffCommand) {
    const { dto, context } = command;
    const { actor, source } = context;

    if (ExecutionPolicy.isUserInitiated(source)) {
      this.policyFactory
        .user(actor)
        .evaluator.check(
          (p) => p.isTargetInActorsManagedClinic(dto.clinicId),
          'Bu yetkiye sahip değilsiniz'
        )
        .orThrow((msg) => {
          // TODO: LOG FIRLAT
        });
    }

    await this.userRepo.softDelete(dto.userId);
  }
}
