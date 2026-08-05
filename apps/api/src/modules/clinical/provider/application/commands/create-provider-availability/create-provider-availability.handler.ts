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
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { CreateProviderAvailabilityCommand } from './create-provider-availability.command';
import {
  IProviderCommandRepository,
  PROVIDER_COMMAND_REPOSITORY,
} from '@modules/clinical/provider/domain/repositories/provider.repository.interface';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { DateTimeManager } from '@common/utils';
import { ProviderNotFoundException } from '@modules/clinical/provider/domain/exceptions/provider.exceptions';
import { AssertTimeWithinClinicHoursQuery } from '@modules/organization/clinic/application/queries/assert-time-within-clinic-hours/assert-time-within-clinic-hours.query';
import { ProviderAvailability } from '@modules/clinical/provider/domain/entities/provider-availability.entity';

@CommandHandler(CreateProviderAvailabilityCommand)
export class CreateProviderAvailabilityHandler implements ICommandHandler<
  CreateProviderAvailabilityCommand,
  void
> {
  constructor(
    @Inject(PROVIDER_COMMAND_REPOSITORY)
    private readonly providerRepo: IProviderCommandRepository,
    @Inject(PROVIDER_AVAILABILITY_COMMAND_REPOSITORY)
    private readonly providerAvailabilityRepo: IProviderAvailabilityCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly transactionManager: TransactionManager,
    private readonly queryBus: TSQueryBus
  ) {}

  async execute(command: CreateProviderAvailabilityCommand): Promise<void> {
    const { ctx, data } = command;

    const provider = await this.providerRepo.findById(data.providerId);

    if (!provider) throw new ProviderNotFoundException();

    provider.validate.operationMode.isStatic.orThrow();

    await this.queryBus.execute(
      new AssertTimeWithinClinicHoursQuery(
        provider.clinicId.value,
        data.availabilities
      )
    );

    this.policyFactory
      .provider(ctx.actor, ctx.source)
      .evaluator.check((p) =>
        p.isTargetInActorsSameClinic(provider.clinicId.value)
      )
      .orThrow(PROVIDER_EVENTS.AVAILABILITY_CREATED);

    const providerAvailabilities = data.availabilities.map((item) =>
      ProviderAvailability.create({
        providerId: data.providerId,
        dayOfWeek: DateTimeManager.getDayOfWeek(item.date),
        startMinute: item.startMinute,
        endMinute: item.endMinute,
        breakStartMinute: item.breakStartMinute,
        breakEndMinute: item.breakEndMinute,
      })
    );

    await this.transactionManager.run(async () => {
      await this.providerAvailabilityRepo.createMany(providerAvailabilities);
    });
  }
}
