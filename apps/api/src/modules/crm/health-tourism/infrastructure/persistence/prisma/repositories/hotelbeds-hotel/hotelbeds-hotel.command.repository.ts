import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import {
  IHotelbedsHotelCommandRepository,
  UpsertHotelbedsHotelInput,
} from '@modules/crm/health-tourism/domain/repositories/hotelbeds-hotel.repository.interface';

@Injectable()
export class HotelbedsHotelCommandRepository
  extends BaseRepository
  implements IHotelbedsHotelCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async upsertMany(hotels: UpsertHotelbedsHotelInput[]): Promise<void> {
    if (hotels.length === 0) return;

    await this.prisma.$transaction(
      hotels.map((h) =>
        this.db.hotelbedsHotel.upsert({
          where: { id: h.id },
          create: {
            id: h.id,
            name: h.name,
            categoryCode: h.categoryCode,
            categoryName: h.categoryName ?? null,
            destinationCode: h.destinationCode,
            destinationName: h.destinationName ?? null,
            address: h.address ?? null,
            latitude: h.latitude ?? null,
            longitude: h.longitude ?? null,
            images: h.images ?? Prisma.JsonNull,
            phones: h.phones ?? Prisma.JsonNull,
            lastSyncedAt: h.lastSyncedAt,
          },
          update: {
            name: h.name,
            categoryCode: h.categoryCode,
            categoryName: h.categoryName ?? null,
            destinationCode: h.destinationCode,
            destinationName: h.destinationName ?? null,
            address: h.address ?? null,
            latitude: h.latitude ?? null,
            longitude: h.longitude ?? null,
            images: h.images ?? Prisma.JsonNull,
            phones: h.phones ?? Prisma.JsonNull,
            lastSyncedAt: h.lastSyncedAt,
          },
        })
      )
    );
  }
}
