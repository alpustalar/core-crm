import { Injectable } from '@nestjs/common';
import { Pagination } from '@shared';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { paginate } from '@src/infrastructure/persistence/prisma/helpers/paginate.helper';
import { IHotelbedsTransferBookingQueryRepository } from '@modules/crm/health-tourism/domain/repositories/hotelbeds-transfer-booking.repository.interface';
import { HotelbedsTransferBooking } from '@modules/crm/health-tourism/domain/entities/hotelbeds-transfer-booking.entity';
import { FindTransferBookingsFilter } from '@modules/crm/health-tourism/domain/types/find-transfer-bookings.type';

@Injectable()
export class HotelbedsTransferBookingQueryRepository
  extends BaseRepository
  implements IHotelbedsTransferBookingQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string): Promise<HotelbedsTransferBooking | null> {
    const raw = await this.db.hotelbedsTransferBooking.findUnique({
      where: { id },
    });
    return raw ? new HotelbedsTransferBooking(raw) : null;
  }

  async findByReference(
    reference: string,
  ): Promise<HotelbedsTransferBooking | null> {
    const raw = await this.db.hotelbedsTransferBooking.findUnique({
      where: { reference },
    });
    return raw ? new HotelbedsTransferBooking(raw) : null;
  }

  async findMany(
    filter: FindTransferBookingsFilter,
    pagination: Pagination,
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
      items: result.items.map((r) => new HotelbedsTransferBooking(r)),
      total: result.total,
    };
  }
}
