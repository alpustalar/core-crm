import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IClinicHealthTourismConfigCommandRepository } from '@modules/crm/health-tourism/config/domain/repositories/clinic-health-tourism-config.repository';
import { ClinicHealthTourismConfig } from '@modules/crm/health-tourism/config/domain/entities/clinic-health-tourism-config.entity';

@Injectable()
export class ClinicHealthTourismConfigCommandRepository
  extends BaseRepository
  implements IClinicHealthTourismConfigCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string): Promise<ClinicHealthTourismConfig | null> {
    const raw = await this.db.clinicHealthTourismConfig.findUnique({
      where: { id },
    });
    return raw ? new ClinicHealthTourismConfig(raw) : null;
  }

  async save(
    entity: ClinicHealthTourismConfig
  ): Promise<ClinicHealthTourismConfig> {
    const data = entity.toPersistence();
    const raw = await this.db.clinicHealthTourismConfig.upsert({
      where: { clinicId: data.clinicId },
      create: data,
      update: {
        isEnabled: data.isEnabled,
        destinationCode: data.destinationCode,
        nearbyHotelCodes: data.nearbyHotelCodes,
        airportIata: data.airportIata,
        clinicLocationType: data.clinicLocationType,
        clinicLocationCode: data.clinicLocationCode,
        pickupAddress: data.pickupAddress,
        serviceFeePercent: data.serviceFeePercent,
        defaultCurrency: data.defaultCurrency,
      },
    });
    entity.flushEvents();
    return new ClinicHealthTourismConfig(raw);
  }
}
