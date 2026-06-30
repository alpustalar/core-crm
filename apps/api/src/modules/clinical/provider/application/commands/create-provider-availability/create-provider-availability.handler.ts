import { PROVIDER_EVENTS } from '@src/domain/constants/events';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';

import {
  IProviderAvailabilityCommandRepository,
  PROVIDER_AVAILABILITY_COMMAND_REPOSITORY,
} from '@modules/clinical/provider/domain/repositories/provider-availability.repository.interface';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/domain/interfaces/policy-factory.interface';
import { CreateProviderAvailabilityCommand } from './create-provider-availability.command';
import {
  IProviderQueryRepository,
  PROVIDER_QUERY_REPOSITORY,
} from '@modules/clinical/provider/domain/repositories/provider.repository.interface';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { DateTimeManager } from '@common/utils';
import { ProviderNotFoundException } from '@modules/clinical/provider/domain/exceptions/provider.exceptions';
import { AssertTimeWithinClinicHoursQuery } from '@modules/organization/clinic/application/queries/assert-time-within-clinic-hours/assert-time-within-clinic-hours.query';

@CommandHandler(CreateProviderAvailabilityCommand)
export class CreateProviderAvailabilityHandler
  implements ICommandHandler<CreateProviderAvailabilityCommand, void>
{
  constructor(
    @Inject(PROVIDER_QUERY_REPOSITORY)
    private readonly providerQueryRepo: IProviderQueryRepository,
    @Inject(PROVIDER_AVAILABILITY_COMMAND_REPOSITORY)
    private readonly providerAvailabilityCommandRepo: IProviderAvailabilityCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly transactionManager: TransactionManager,
    private readonly queryBus: TSQueryBus
  ) {}

  async execute(command: CreateProviderAvailabilityCommand): Promise<void> {
    const {
      ctx: { actor, source },
      dto,
    } = command;

    const provider = await this.providerQueryRepo.findById(dto.providerId);

    if (!provider) throw new ProviderNotFoundException();

    provider.validate.isStaticMode.orThrow();

    await this.queryBus.execute(
      new AssertTimeWithinClinicHoursQuery(
        provider.clinicId,
        dto.availabilities
      )
    );

    this.policyFactory
      .provider(actor)
      .evaluator.systemBypass(source)
      .check((p) => p.isTargetInActorsSameClinic(provider.clinicId))
      .orThrow(PROVIDER_EVENTS.AVAILABILITY_CREATED);

    await this.transactionManager.run(async () => {
      await this.providerAvailabilityCommandRepo.createMany(
        dto.availabilities.map((item) => ({
          providerId: dto.providerId,
          dayOfWeek: DateTimeManager.getDayOfWeek(item.date),
          startMinute: item.startMinute,
          endMinute: item.endMinute,
          breakStartMinute: item.breakStartMinute,
          breakEndMinute: item.breakEndMinute,
        }))
      );
    });
  }
}
