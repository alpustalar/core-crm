import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SoftDeleteUserByStaffCommand } from '@modules/user/application/commands/soft-delete-user-by-staff/soft-delete-user-by-staff.command';
import { Inject } from '@nestjs/common';
import {
  IUserCommandRepository,
  USER_COMMAND_REPOSITORY,
} from '@modules/user/domain/repositories/user.repository';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/policy/domain/interfaces/policy-factory.interface';
import {
  IUserEventPublisher,
  USER_EVENT_PUBLISHER,
} from '@modules/user/domain/interfaces/user-event-publisher.interface';
import { ExecutionPolicy } from '@src/domain/common/execution/execution.policy';
import { SoftDeleteUserByStaffResponse } from '@modules/user/application/commands/soft-delete-user-by-staff/soft-delete-user-by-staff.response';

@CommandHandler(SoftDeleteUserByStaffCommand)
export class SoftDeleteUserByStaffHandler
  implements
    ICommandHandler<
      SoftDeleteUserByStaffCommand,
      SoftDeleteUserByStaffResponse
    >
{
  constructor(
    @Inject(USER_COMMAND_REPOSITORY)
    private readonly userRepo: IUserCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    @Inject(USER_EVENT_PUBLISHER)
    private readonly userEventPublisher: IUserEventPublisher
  ) {}

  async execute(
    command: SoftDeleteUserByStaffCommand
  ): Promise<SoftDeleteUserByStaffResponse> {
    const { dto, ctx } = command;
    const { actor, source } = ctx;

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
