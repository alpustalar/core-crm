import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/domain/interfaces/policy-factory.interface';
import {
  IProviderQueryRepository,
  PROVIDER_QUERY_REPOSITORY,
} from '@modules/clinical/provider/domain/repositories/provider.repository.interface';

import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { CreateProviderShiftCommand } from './create-provider-shift.command';
import { ExecutionPolicy } from '@src/domain/common/execution/execution.policy';
import { PROVIDER_EVENTS } from '@src/domain/constants/events';
import { ProviderNotFoundException } from '@modules/clinical/provider/domain/exceptions/provider.exceptions';
import {
  IProviderShiftCommandRepository,
  PROVIDER_SHIFT_COMMAND_REPOSITORY,
} from '@modules/clinical/provider/domain/repositories/provider-shift.repository.interface';
import { ProviderShift } from '@modules/clinical/provider/domain/entities/provider-shift.entity';
import { AssertTimeWithinClinicHoursQuery } from '@modules/organization/clinic/application/queries/assert-time-within-clinic-hours/assert-time-within-clinic-hours.query';

@CommandHandler(CreateProviderShiftCommand)
export class CreateProviderShiftHandler
  implements ICommandHandler<CreateProviderShiftCommand, void>
{
  constructor(
    @Inject(PROVIDER_QUERY_REPOSITORY)
    private readonly providerQueryRepo: IProviderQueryRepository,
    @Inject(PROVIDER_SHIFT_COMMAND_REPOSITORY)
    private readonly providerShiftCommandRepo: IProviderShiftCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly transactionManager: TransactionManager,
    private readonly queryBus: TSQueryBus
  ) {}

  async execute(command: CreateProviderShiftCommand): Promise<void> {
    const {
      ctx: { actor, source },
      dto: { providerId, shifts },
    } = command;

    const provider = await this.providerQueryRepo.findById(providerId);
    if (!provider) throw new ProviderNotFoundException();

    this.policyFactory
      .provider(actor)
      .evaluator.bypassIf(ExecutionPolicy.isSystemInitiated(source))
      .check((p) => p.isTargetInActorsSameClinic(provider.clinicId.value))
      .orThrow(PROVIDER_EVENTS.SHIFT_CREATED);

    provider.validate.operationMode.isShift.orThrow();

    await this.transactionManager.run(async () => {
      await this.queryBus.execute(
        new AssertTimeWithinClinicHoursQuery(provider.clinicId.value, shifts)
      );

      const preparedShifts = shifts.map((shift) =>
        ProviderShift.create({
          ...shift,
          providerId,
        })
      );

      await this.providerShiftCommandRepo.replaceShiftsForDates(preparedShifts);
    });
  }
}
