import { BadRequestException, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import {
  IProviderRepository,
  PROVIDER_REPO_TOKEN,
} from '@modules/provider/domain/repositories/provider.repository.interface';
import {
  IProviderAvailabilityRepository,
  PROVIDER_AVAILABILITY_REPO_TOKEN,
} from '@modules/provider/domain/repositories/provider-availability.repository.interface';
import {
  CLINIC_AVAILABILITY_DOMAIN_SERVICE_TOKEN,
  IClinicAvailabilityDomainService,
} from '@modules/clinic/domain/interfaces/clinic-availability.domain-service.interface';
import {
  CLINIC_MODULE_API_TOKEN,
  IClinicModuleApi,
} from '@modules/clinic/domain/interfaces/clinic-module.api.interface';
import {
  IPolicyFactory,
  POLICY_FACTORY_TOKEN,
} from '@modules/policy/domain/interfaces/policy-factory.interface';
import { CreateProviderAvailabilityCommand } from './create-provider-availability.command';

@CommandHandler(CreateProviderAvailabilityCommand)
export class CreateProviderAvailabilityHandler
  implements ICommandHandler<CreateProviderAvailabilityCommand, void>
{
  constructor(
    @Inject(PROVIDER_REPO_TOKEN)
    private readonly providerRepo: IProviderRepository,
    @Inject(PROVIDER_AVAILABILITY_REPO_TOKEN)
    private readonly providerAvailabilityRepo: IProviderAvailabilityRepository,
    @Inject(CLINIC_AVAILABILITY_DOMAIN_SERVICE_TOKEN)
    private readonly clinicAvailabilityDomainService: IClinicAvailabilityDomainService,
    @Inject(CLINIC_MODULE_API_TOKEN)
    private readonly clinicModuleApi: IClinicModuleApi,
    @Inject(POLICY_FACTORY_TOKEN)
    private readonly policyFactory: IPolicyFactory,
    private readonly transactionManager: TransactionManager
  ) {}

  async execute(command: CreateProviderAvailabilityCommand) {
    const {
      context: { actor },
      dto: { providerId, availabilities },
    } = command;

    const { evaluator } = this.policyFactory.user(actor);

    evaluator
      .check((p) => p.isTargetInActorsSameClinic(actor.clinicId))
      .orThrow();

    await this.transactionManager.run(async () => {
      const provider = await this.providerRepo.findById(providerId);

      if (!provider) {
        throw new BadRequestException('Doktor bulunamadı.');
      }

      const { clinicId } = provider;

      for (const item of availabilities) {
        const { data: clinicSchedule } =
          await this.clinicModuleApi.findAvailabilityByDay(clinicId, item.date);

        this.clinicAvailabilityDomainService.validateTimeWithinClinicHoursOrThrow(
          {
            startMinute: item.startMinute,
            endMinute: item.endMinute,
            clinicSchedule,
          }
        );
      }

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
