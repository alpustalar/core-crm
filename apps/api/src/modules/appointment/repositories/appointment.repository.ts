import { Injectable } from '@nestjs/common';
import { PrismaService } from '@modules/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AppointmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  softDeleteAllAppointmentsByClinicId(
    clinicId: Prisma.AppointmentWhereInput['clinicId'],
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;
    return client.appointment.updateMany({
      where: { clinicId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }
}
