import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import {
  FindPatientByContactFilter,
  FindPatientsFilter,
} from '@modules/crm/patient/domain/contracts/patient.contracts';
import { Patient } from '@shared';
import { Pagination } from '@shared/common';
import { Paginated } from '@common/interfaces/paginated.type';
import { paginate } from '@src/infrastructure/persistence/prisma/helpers/paginate.helper';
import { Prisma } from '@prisma/client';

@Injectable()
export class PatientQueryRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findByContact(
    filter: FindPatientByContactFilter
  ): Promise<Patient | null> {
    const { organizationId, phone, email } = filter;
    if (!phone && !email) return null;

    const orConditions: Record<string, unknown>[] = [];
    if (phone) orConditions.push({ phone });
    if (email) orConditions.push({ email });

    return await this.db.patient.findFirst({
      where: { organizationId, OR: orConditions },
    });
  }

  findById(id: string): Promise<Patient | null> {
    return this.db.patient.findUnique({ where: { id } });
  }

  /**
   * Arama `paginate` helper'ının tek-kolonlu `search`i yerine burada açıkça
   * kuruluyor: resepsiyon hastayı ada, soyada, telefona ya da protokol numarasına
   * göre arar — hangisini yazdığını önceden bilemeyiz.
   *
   * Silinmiş kayıtlar (`deletedAt`) listeye girmez.
   */
  findMany(
    filter: FindPatientsFilter,
    pagination: Pagination
  ): Promise<Paginated<Patient>> {
    const where: Prisma.PatientWhereInput = {
      organizationId: filter.organizationId,
      deletedAt: null,
    };

    if (filter.clinicId) where.clinicId = filter.clinicId;
    if (filter.status) where.status = filter.status;

    if (filter.search) {
      const contains = { contains: filter.search, mode: 'insensitive' } as const;
      where.OR = [
        { firstName: contains },
        { lastName: contains },
        { phone: { contains: filter.search } },
        { protocolNo: { contains: filter.search } },
      ];
    }

    return paginate({
      delegate: this.db.patient,
      pagination,
      where,
    });
  }
}
