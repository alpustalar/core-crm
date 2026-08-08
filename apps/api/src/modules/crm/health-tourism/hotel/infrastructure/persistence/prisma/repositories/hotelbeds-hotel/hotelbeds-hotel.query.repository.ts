import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { IHotelbedsHotelQueryRepository } from '@modules/crm/health-tourism/hotel/domain/repositories/hotelbeds-hotel/hotelbeds-hotel.query.repository';
import { HotelbedsHotel } from '@shared';

@Injectable()
export class HotelbedsHotelQueryRepository
  extends BaseRepository
  implements IHotelbedsHotelQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findById(id: string): Promise<HotelbedsHotel | null> {
    return this.db.hotelbedsHotel.findUnique({ where: { id } });
  }

  findByDestination(destinationCode: string): Promise<HotelbedsHotel[]> {
    return this.db.hotelbedsHotel.findMany({
      where: { destinationCode },
      orderBy: { name: 'asc' },
    });
  }

  async countByCountry(): Promise<number> {
    return this.db.hotelbedsHotel.count();
  }
}
