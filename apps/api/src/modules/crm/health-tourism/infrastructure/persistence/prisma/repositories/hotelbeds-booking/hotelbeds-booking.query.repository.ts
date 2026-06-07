import { Injectable } from '@nestjs/common';
import { Pagination } from '@shared';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { paginate } from '@src/infrastructure/persistence/prisma/helpers/paginate.helper';
import {
  IHotelbedsBookingQueryRepository,
} from '@modules/crm/health-tourism/domain/repositories/hotelbeds-booking.repository.interface';
import { HotelbedsBooking } from '@modules/crm/health-tourism/domain/entities/hotelbeds-booking.entity';
import { FindHotelBookingsFilter } from '@modules/crm/health-tourism/domain/types/find-hotel-bookings.type';

@Injectable()
export class HotelbedsBookingQueryRepository
  extends BaseRepository
  implements IHotelbedsBookingQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string): Promise<HotelbedsBooking | null> {
    const raw = await this.db.hotelbedsBooking.findUnique({ where: { id } });
    return raw ? new HotelbedsBooking(raw) : null;
  }

  async findMany(
    filter: FindHotelBookingsFilter,
    pagination: Pagination,
  ): Promise<{ items: HotelbedsBooking[]; total: number }> {
    const where = {
      organizationId: filter.organizationId,
      ...(filter.patientId ? { patientId: filter.patientId } : {}),
      ...(filter.leadId ? { leadId: filter.leadId } : {}),
    };

    const result = await paginate({
      delegate: this.db.hotelbedsBooking,
      pagination,
      where,
    });

    return {
      items: result.items.map((r) => new HotelbedsBooking(r)),
      total: result.total,
    };
  }
}
