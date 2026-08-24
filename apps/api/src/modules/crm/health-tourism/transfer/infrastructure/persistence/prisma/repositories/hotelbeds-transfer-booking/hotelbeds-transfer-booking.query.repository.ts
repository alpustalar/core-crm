import { Injectable } from '@nestjs/common';
import { HotelbedsTransferBooking, Pagination } from '@shared';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { paginate } from '@src/infrastructure/persistence/prisma/helpers/paginate.helper';
import { FindTransferBookingsFilter } from '@modules/crm/health-tourism/transfer/domain/contracts/hotelbeds-transfer-booking';
import { IHotelbedsTransferBookingQueryRepository } from '@modules/crm/health-tourism/transfer/domain/repositories/hotelbeds-transfer-booking/hotelbeds-transfer-booking.query.repository';

@Injectable()
export class HotelbedsTransferBookingQueryRepository
  extends BaseRepository
  implements IHotelbedsTransferBookingQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findById(id: string): Promise<HotelbedsTransferBooking | null> {
    return this.db.hotelbedsTransferBooking.findUnique({
      where: { id },
    });
  }

  findByReference(reference: string): Promise<HotelbedsTransferBooking | null> {
    return this.db.hotelbedsTransferBooking.findUnique({
      where: { reference },
    });
  }

  async findMany(
    filter: FindTransferBookingsFilter,
    pagination: Pagination
  ): Promise<{ items: HotelbedsTransferBooking[]; total: number }> {
    const where = {
      organizationId: filter.organizationId,
      ...(filter.clinicId ? { clinicId: filter.clinicId } : {}),
      ...(filter.patientId ? { patientId: filter.patientId } : {}),
      ...(filter.leadId ? { leadId: filter.leadId } : {}),
    };

    const result = await paginate({
      delegate: this.db.hotelbedsTransferBooking,
      pagination,
      where,
    });

    return {
      items: result.items,
      total: result.total,
    };
  }
}
