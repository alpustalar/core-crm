import { BadRequestException, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';

import {
  IProviderAvailabilityRepository,
  PROVIDER_AVAILABILITY_REPOSITORY,
} from '@modules/provider/domain/repositories/provider-availability.repository.interface';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/policy/domain/interfaces/policy-factory.interface';
import { CreateProviderAvailabilityCommand } from './create-provider-availability.command';
import {
  IProviderQueryRepository,
  PROVIDER_QUERY_REPOSITORY,
} from '@modules/provider/domain/repositories/provider.repository.interface';
import { ValidateTimeWithinClinicHoursOrThrowQuery } from '@modules/clinic/application/queries/validate-time-within-clinic-hours/validate-time-within-clinic-hours.query';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';

@CommandHandler(CreateProviderAvailabilityCommand)
export class CreateProviderAvailabilityHandler
  implements ICommandHandler<CreateProviderAvailabilityCommand, void>
{
  constructor(
    @Inject(PROVIDER_QUERY_REPOSITORY)
    private readonly providerQueryRepo: IProviderQueryRepository,
    @Inject(PROVIDER_AVAILABILITY_REPOSITORY)
    private readonly providerAvailabilityRepo: IProviderAvailabilityRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly transactionManager: TransactionManager,
    private readonly queryBus: TSQueryBus
  ) {}

  async execute(command: CreateProviderAvailabilityCommand) {
    const {
      ctx: { actor },
      dto: { providerId, availabilities },
    } = command;

    const { evaluator } = this.policyFactory.user(actor);

    evaluator
      .check((p) => p.isTargetInActorsSameClinic(actor.clinicId))
      .orThrow();

    await this.transactionManager.run(async () => {
      const provider = await this.providerQueryRepo.findById(providerId);

      if (!provider) {
        throw new BadRequestException('Uzman bulunamadı.');
      }

      if (!provider.isStaticMode()) {
        throw new BadRequestException(
          'Statik müsaitlik yalnızca STATIC modundaki uzmanlar için tanımlanabilir.'
        );
      }

      const { clinicId } = provider;

      await this.queryBus.execute(
        new ValidateTimeWithinClinicHoursOrThrowQuery(clinicId, availabilities)
      );

      return Promise.all(
        availabilities.map((item) =>
          this.providerAvailabilityRepo.create({
            providerId: providerId,
            dayOfWeek: item.date.getDay(),
            startMinute: item.startMinute,
            endMinute: item.endMinute,
            breakStartMinute: item.breakStartMinute,
            breakEndMinute: item.breakEndMinute,
          })
        )
      );
    });
  }
}
