import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class DoctorRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.DoctorCreateInput, tx?: Prisma.TransactionClient) {
    const client = tx ?? this.prisma;
    return client.doctor.create({ data });
  }
}
