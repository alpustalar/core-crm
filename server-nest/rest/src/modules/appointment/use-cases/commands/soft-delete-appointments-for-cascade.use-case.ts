import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@modules/prisma/prisma.service';
import { AppointmentRepository } from '@modules/appointment/repositories/appointment.repository';

@Injectable()
export class SoftDeleteAppointmentsForCascadeUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly appointmentRepo: AppointmentRepository,
  ) {}

  async execute(clinicId: string, tx?: Prisma.TransactionClient) {
    const client = tx ?? this.prisma;
    return this.appointmentRepo.softDeleteAllAppointmentsByClinicId(
      clinicId,
      client,
    );
  }
}
