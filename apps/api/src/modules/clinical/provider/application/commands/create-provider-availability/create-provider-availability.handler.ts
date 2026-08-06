import { PROVIDER_EVENTS } from '@src/domain/constants/events';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { CreateProviderAvailabilityCommand } from './create-provider-availability.command';

import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { DateTimeManager } from '@common/utils';
import { ProviderNotFoundException } from '@modules/clinical/provider/domain/exceptions/provider.exceptions';
import { ProviderAvailability } from '@modules/clinical/provider/domain/entities/provider-availability.entity';
import {
  IProviderCommandRepository,
  PROVIDER_COMMAND_REPOSITORY,
} from '@modules/clinical/provider/domain/repositories/provider/provider.command.repository.interface';
import {
  IProviderAvailabilityCommandRepository,
  PROVIDER_AVAILABILITY_COMMAND_REPOSITORY,
} from '@modules/clinical/provider/domain/repositories/provider-availability/provider-availability.command.repository.interface';
import {
  CLINIC_BOOKING_SERVICE,
  IClinicBookingService,
} from '@modules/organization/clinic/domain/services/clinic-booking/clinic-booking.service.interface';

@CommandHandler(CreateProviderAvailabilityCommand)
export class CreateProviderAvailabilityHandler
  implements ICommandHandler<CreateProviderAvailabilityCommand, void>
{
  constructor(
    @Inject(PROVIDER_COMMAND_REPOSITORY)
    private readonly providerRepo: IProviderCommandRepository,
    @Inject(PROVIDER_AVAILABILITY_COMMAND_REPOSITORY)
    private readonly providerAvailabilityRepo: IProviderAvailabilityCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    @Inject(CLINIC_BOOKING_SERVICE)
    private readonly clinicBookingService: IClinicBookingService,
    private readonly transactionManager: TransactionManager,
    private readonly queryBus: TSQueryBus
  ) {}

  async execute(command: CreateProviderAvailabilityCommand): Promise<void> {
    const { ctx, data } = command;

    const provider = await this.providerRepo.findById(data.providerId);

    if (!provider) throw new ProviderNotFoundException();

    provider.validate.operationMode.isStatic.orThrow();

    await this.clinicBookingService.assertTimeWithinClinicHours({
      clinicId: provider.clinicId.value,
      items: data.availabilities,
    });

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
