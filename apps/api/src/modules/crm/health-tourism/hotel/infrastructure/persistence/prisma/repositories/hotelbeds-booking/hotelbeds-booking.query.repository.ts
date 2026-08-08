import { Injectable } from '@nestjs/common';
import { HotelbedsBooking as IHotelbedsBooking, Pagination } from '@shared';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { paginate } from '@src/infrastructure/persistence/prisma/helpers/paginate.helper';
import { FindHotelBookingsFilter } from '@modules/crm/health-tourism/hotel/domain/contracts/hotel.contracts';
import { IHotelbedsBookingQueryRepository } from '@modules/crm/health-tourism/hotel/domain/repositories/hotelbeds-booking/hotelbeds-booking.query.repository';

/** Okuma tarafı: entity hidrate edilmez (veri doğrudan HTTP sınırını geçiyor). */
@Injectable()
export class HotelbedsBookingQueryRepository
  extends BaseRepository
  implements IHotelbedsBookingQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findById(id: string): Promise<IHotelbedsBooking | null> {
    return this.db.hotelbedsBooking.findUnique({ where: { id } });
  }

  findMany(
    filter: FindHotelBookingsFilter,
    pagination: Pagination
  ): Promise<{ items: IHotelbedsBooking[]; total: number }> {
    const where = {
      organizationId: filter.organizationId,
      ...(filter.patientId ? { patientId: filter.patientId } : {}),
      ...(filter.leadId ? { leadId: filter.leadId } : {}),
    };

    return paginate({
      delegate: this.db.hotelbedsBooking,
      pagination,
      where,
    });
  }
}
