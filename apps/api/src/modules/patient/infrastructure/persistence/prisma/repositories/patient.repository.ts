import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IPatientRepository } from '@modules/patient/domain/repositories/patient.repository.interface';

@Injectable()
export class PatientRepository
  extends BaseRepository
  implements IPatientRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  find(id: string) {
    return this.db.patient.findUnique({
      where: { id },
    });
  }
}
