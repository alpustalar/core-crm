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
import {
  IProviderQueryRepository,
  PROVIDER_QUERY_REPOSITORY,
} from '@modules/provider/domain/repositories/provider.repository.interface';
import { ValidateTimeWithinClinicHoursOrThrowQuery } from '@modules/clinic/application/queries/validate-time-within-clinic-hours/validate-time-within-clinic-hours.query';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { CreateProviderShiftCommand } from './create-provider-shift.command';

@CommandHandler(CreateProviderShiftCommand)
export class CreateProviderShiftHandler
  implements ICommandHandler<CreateProviderShiftCommand, void>
{
  constructor(
    @Inject(PROVIDER_QUERY_REPOSITORY)
    private readonly providerQueryRepo: IProviderQueryRepository,
    @Inject(PROVIDER_AVAILABILITY_REPOSITORY)
    private readonly providerAvailabilityRepo: IProviderAvailabilityRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly transactionManager: TransactionManager,
    private readonly queryBus: TSQueryBus,
  ) {}

  async execute(command: CreateProviderShiftCommand): Promise<void> {
    const {
      ctx: { actor },
      dto: { providerId, shifts },
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

      if (!provider.isShiftMode()) {
        throw new BadRequestException(
          'Vardiya yalnızca SHIFT modundaki uzmanlar için tanımlanabilir.',
        );
      }

      await this.queryBus.execute(
        new ValidateTimeWithinClinicHoursOrThrowQuery(provider.clinicId, shifts),
      );

      await this.providerAvailabilityRepo.upsertManyShifts(
        shifts.map((s) => ({ ...s, providerId })),
      );
    });
  }
}
