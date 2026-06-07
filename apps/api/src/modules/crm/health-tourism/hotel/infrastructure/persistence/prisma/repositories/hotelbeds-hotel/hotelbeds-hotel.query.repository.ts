import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import {
  IHotelbedsHotelQueryRepository,
} from '@modules/crm/health-tourism/hotel/domain/repositories/hotelbeds-hotel.repository.interface';
import { HotelbedsHotel } from '@modules/crm/health-tourism/hotel/domain/entities/hotelbeds-hotel.entity';

@Injectable()
export class HotelbedsHotelQueryRepository
  extends BaseRepository
  implements IHotelbedsHotelQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string): Promise<HotelbedsHotel | null> {
    const raw = await this.db.hotelbedsHotel.findUnique({ where: { id } });
    return raw ? new HotelbedsHotel(raw) : null;
  }

  async findByDestination(destinationCode: string): Promise<HotelbedsHotel[]> {
    const rows = await this.db.hotelbedsHotel.findMany({
      where: { destinationCode },
      orderBy: { name: 'asc' },
    });
    return rows.map((r) => new HotelbedsHotel(r));
  }

  async countByCountry(): Promise<number> {
    return this.db.hotelbedsHotel.count();
  }
}
