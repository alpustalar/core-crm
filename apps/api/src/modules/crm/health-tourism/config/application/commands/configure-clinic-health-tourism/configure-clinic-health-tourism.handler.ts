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

@CommandHandler(ConfigureClinicHealthTourismCommand)
export class ConfigureClinicHealthTourismHandler
  implements ICommandHandler<ConfigureClinicHealthTourismCommand, string>
{
  constructor(
    @Inject(CLINIC_HEALTH_TOURISM_CONFIG_COMMAND_REPOSITORY)
    private readonly configCommandRepo: IClinicHealthTourismConfigCommandRepository,
    @Inject(CLINIC_HEALTH_TOURISM_CONFIG_QUERY_REPOSITORY)
    private readonly configQueryRepo: IClinicHealthTourismConfigQueryRepository,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: ConfigureClinicHealthTourismCommand): Promise<string> {
    const { clinicId, input, ctx } = command;

    const existing = await this.configQueryRepo.findByClinicId(clinicId);

    const config =
      existing ??
      ClinicHealthTourismConfig.create({
        clinicId,
        organizationId: ctx.actor.organizationId!,
      });

    config.updateSettings({
      isEnabled: input.isEnabled,
      destinationCode: input.destinationCode,
      nearbyHotelCodes: input.nearbyHotelCodes,
      airportIata: input.airportIata,
      clinicLocationType: input.clinicLocationType,
      clinicLocationCode: input.clinicLocationCode,
      pickupAddress: input.pickupAddress,
      serviceFeePercent: input.serviceFeePercent,
      defaultCurrency: input.defaultCurrency,
    });

    const saved = await this.txManager.run(() =>
      this.configCommandRepo.save(config)
    );
    return saved.id.value;
  }
}
