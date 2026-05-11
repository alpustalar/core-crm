import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';

@Injectable()
export class PatientRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findById(id: string) {
    return this.db.patient.findUniqueOrThrow({
      where: { id },
      select: { firstName: true, lastName: true, phone: true, email: true },
    });
  }
}
