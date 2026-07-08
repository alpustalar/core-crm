import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import {
  CLINIC_HEALTH_TOURISM_CONFIG_COMMAND_REPOSITORY,
  CLINIC_HEALTH_TOURISM_CONFIG_QUERY_REPOSITORY,
  IClinicHealthTourismConfigCommandRepository,
  IClinicHealthTourismConfigQueryRepository,
} from '@modules/crm/health-tourism/config/domain/repositories/clinic-health-tourism-config.repository';
import { ClinicHealthTourismConfig } from '@modules/crm/health-tourism/config/domain/entities/clinic-health-tourism-config.entity';
import { ConfigureClinicHealthTourismCommand } from './configure-clinic-health-tourism.command';
import { OrganizationNotAssignedException } from '@src/domain/exceptions/organization-not-assigned.exception';

@CommandHandler(ConfigureClinicHealthTourismCommand)
export class ConfigureClinicHealthTourismHandler
  implements ICommandHandler<ConfigureClinicHealthTourismCommand, string>
{
  constructor(
    @Inject(CLINIC_HEALTH_TOURISM_CONFIG_COMMAND_REPOSITORY)
    private readonly clinicHealthTourismConfigCommandRepo: IClinicHealthTourismConfigCommandRepository,
    @Inject(CLINIC_HEALTH_TOURISM_CONFIG_QUERY_REPOSITORY)
    private readonly ClinicHealthTourismConfigQueryRepo: IClinicHealthTourismConfigQueryRepository,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: ConfigureClinicHealthTourismCommand): Promise<string> {
    const { clinicId, dto, ctx } = command;

    const existing =
      await this.ClinicHealthTourismConfigQueryRepo.findByClinicId(clinicId);

    if (!ctx.actor.organizationId) throw new OrganizationNotAssignedException();

    const config =
      existing ??
      ClinicHealthTourismConfig.create({
        clinicId,
        organizationId: ctx.actor.organizationId,
      });

    config.updateSettings({
      isEnabled: dto.isEnabled,
      destinationCode: dto.destinationCode,
      nearbyHotelCodes: dto.nearbyHotelCodes,
      airportIata: dto.airportIata,
      clinicLocationType: dto.clinicLocationType,
      clinicLocationCode: dto.clinicLocationCode,
      pickupAddress: dto.pickupAddress,
      serviceFeePercent: dto.serviceFeePercent,
      defaultCurrency: dto.defaultCurrency,
    });

    const sync = await this.txManager.run(() =>
      this.clinicHealthTourismConfigCommandRepo.sync(config)
    );
    return sync.id.value;
  }
}
