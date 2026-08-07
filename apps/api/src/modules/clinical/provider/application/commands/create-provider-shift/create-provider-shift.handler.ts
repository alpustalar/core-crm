import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { CreateProviderShiftCommand } from './create-provider-shift.command';
import { PROVIDER_EVENTS } from '@src/domain/constants/events';
import { ProviderNotFoundException } from '@modules/clinical/provider/domain/exceptions/provider.exceptions';

import { ProviderShift } from '@modules/clinical/provider/domain/entities/provider-shift.entity';

import {
  IProviderCommandRepository,
  PROVIDER_COMMAND_REPOSITORY,
} from '@modules/clinical/provider/domain/repositories/provider/provider.command.repository';
import {
  IProviderShiftCommandRepository,
  PROVIDER_SHIFT_COMMAND_REPOSITORY,
} from '@modules/clinical/provider/domain/repositories/provider-shift/provider-shift.command.repository';
import {
  CLINIC_BOOKING_SERVICE,
  IClinicBookingService,
} from '@modules/organization/clinic/domain/services/clinic-booking/clinic-booking.service.interface';

@CommandHandler(CreateProviderShiftCommand)
export class CreateProviderShiftHandler
  implements ICommandHandler<CreateProviderShiftCommand, void>
{
  constructor(
    @Inject(PROVIDER_COMMAND_REPOSITORY)
    private readonly providerRepo: IProviderCommandRepository,
    @Inject(PROVIDER_SHIFT_COMMAND_REPOSITORY)
    private readonly providerShiftRepo: IProviderShiftCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    @Inject(CLINIC_BOOKING_SERVICE)
    private readonly clinicBookingService: IClinicBookingService,
    private readonly transactionManager: TransactionManager
  ) {}

  async execute(command: CreateProviderShiftCommand): Promise<void> {
    const {
      ctx: { actor, source },
      data: { providerId, shifts },
    } = command;

    const provider = await this.providerRepo.findById(providerId);

    if (!provider) throw new ProviderNotFoundException();

    this.policyFactory
      .provider(actor, source)
      .evaluator.check((p) =>
        p.isTargetInActorsSameClinic(provider.clinicId.value)
      )
      .orThrow(PROVIDER_EVENTS.SHIFT_CREATED);

    provider.validate.operationMode.isShift.orThrow();

    await this.transactionManager.run(async () => {
      await this.clinicBookingService.assertTimeWithinClinicHours({
        clinicId: provider.clinicId.value,
        items: shifts,
      });

      const preparedShifts = shifts.map((shift) =>
        ProviderShift.create({
          ...shift,
          providerId,
        })
      );

      await this.providerShiftRepo.replaceShiftsForDates(preparedShifts);
    });
  }
}
