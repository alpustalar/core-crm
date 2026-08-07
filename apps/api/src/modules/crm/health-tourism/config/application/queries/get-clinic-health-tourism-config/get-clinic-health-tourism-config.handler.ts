import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetClinicHealthTourismConfigQuery } from './get-clinic-health-tourism-config.query';
import { GetClinicHealthTourismConfigResponse } from './get-clinic-health-tourism-config.response';
import {
  CLINIC_HEALTH_TOURISM_CONFIG_QUERY_REPOSITORY,
  IClinicHealthTourismConfigQueryRepository,
} from '@modules/crm/health-tourism/config/domain/repositories/clinic-health-tourism-config/clinic-health-tourism-config.query.repository';

@QueryHandler(GetClinicHealthTourismConfigQuery)
export class GetClinicHealthTourismConfigHandler
  implements
    IQueryHandler<
      GetClinicHealthTourismConfigQuery,
      GetClinicHealthTourismConfigResponse
    >
{
  constructor(
    @Inject(CLINIC_HEALTH_TOURISM_CONFIG_QUERY_REPOSITORY)
    private readonly clinicHealthTourismConfigRepo: IClinicHealthTourismConfigQueryRepository
  ) {}

  async execute(
    query: GetClinicHealthTourismConfigQuery
  ): Promise<GetClinicHealthTourismConfigResponse> {
    const config = await this.clinicHealthTourismConfigRepo.findByClinicId(
      query.clinicId
    );
    if (!config) return { data: null };

    return {
      data: {
        id: config.id,
        clinicId: config.clinicId,
        isEnabled: config.isEnabled,
        destinationCode: config.destinationCode,
        nearbyHotelCodes: config.nearbyHotelCodes,
        airportIata: config.airportIata,
        clinicLocationType: config.clinicLocationType,
        clinicLocationCode: config.clinicLocationCode,
        pickupAddress: config.pickupAddress,
        defaultCurrency: config.defaultCurrency,
        createdAt: config.createdAt,
        updatedAt: config.updatedAt,
      },
    };
  }
}
