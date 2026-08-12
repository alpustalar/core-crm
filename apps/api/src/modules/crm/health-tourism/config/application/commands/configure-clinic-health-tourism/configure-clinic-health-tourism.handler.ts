import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { ClinicHealthTourismConfig } from '@modules/crm/health-tourism/config/domain/entities/clinic-health-tourism-config.entity';
import { ConfigureClinicHealthTourismCommand } from './configure-clinic-health-tourism.command';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { HEALTH_TOURISM_CONFIG_EVENTS } from '@src/domain/constants/events';
import {
  CLINIC_HEALTH_TOURISM_CONFIG_COMMAND_REPOSITORY,
  IClinicHealthTourismConfigCommandRepository,
} from '@modules/crm/health-tourism/config/domain/repositories/clinic-health-tourism-config/clinic-health-tourism-config.command.repository';
import { TENANT_SCOPE_RESOLVER } from '@modules/organization/clinic/domain/services/tenant-scope/tenant-scope.resolver.interface';
import { ITenantScopeResolver } from '@shared';

@CommandHandler(ConfigureClinicHealthTourismCommand)
export class ConfigureClinicHealthTourismHandler
  implements ICommandHandler<ConfigureClinicHealthTourismCommand, string>
{
  constructor(
    @Inject(CLINIC_HEALTH_TOURISM_CONFIG_COMMAND_REPOSITORY)
    private readonly clinicHealthTourismConfigRepo: IClinicHealthTourismConfigCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    @Inject(TENANT_SCOPE_RESOLVER)
    private readonly tenantScopeResolver: ITenantScopeResolver,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: ConfigureClinicHealthTourismCommand): Promise<string> {
    const { clinicId, data, ctx } = command.payload;

    let config =
      await this.clinicHealthTourismConfigRepo.findByClinicId(clinicId);

    if (!config) {
      const organizationId = await this.tenantScopeResolver.resolve(
        command.payload
      );

      config = ClinicHealthTourismConfig.create({
        clinicId,
        organizationId,
      });
    }

    this.policyFactory
      .clinic(ctx.actor, ctx.source)
      .evaluator.check((p) => p.actorCanAccessTargetClinic(clinicId))
      .orThrow(HEALTH_TOURISM_CONFIG_EVENTS.CONFIG);

    config.updateSettings({
      isEnabled: data.isEnabled,
      destinationCode: data.destinationCode,
      nearbyHotelCodes: data.nearbyHotelCodes,
      airportIata: data.airportIata,
      clinicLocationType: data.clinicLocationType,
      clinicLocationCode: data.clinicLocationCode,
      pickupAddress: data.pickupAddress,
      defaultCurrency: data.defaultCurrency,
    });

    const sync = await this.txManager.run(() =>
      this.clinicHealthTourismConfigRepo.sync(config)
    );
    return sync.id.value;
  }
}
