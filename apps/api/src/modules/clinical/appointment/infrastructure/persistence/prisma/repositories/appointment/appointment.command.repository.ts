import { Injectable } from '@nestjs/common';
import { BaseCommandRepository } from '@src/infrastructure/persistence/prisma/base-command.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { Appointment } from '@modules/clinical/appointment/domain/entities/appointment.entity';
import { IAppointmentCommandRepository } from '@modules/clinical/appointment/domain/repositories/appointment.repository.interface';
import { BatchPayload } from '@common/interfaces/batcy-payload.type';
import { txStorage } from '@src/infrastructure/persistence/prisma/transaction';

@Injectable()
export class AppointmentCommandRepository
  extends BaseCommandRepository<Appointment>
  implements IAppointmentCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async softDeleteAllAppointmentsByClinicId(
    clinicId: string
  ): Promise<BatchPayload> {
    return this.db.appointment.updateMany({
      where: { clinicId },
      data: { isDeleted: true, deletedAt: new Date() },
    });
  }

  async softDeleteAllByOrganizationId(
    organizationId: string
  ): Promise<BatchPayload> {
    return this.db.appointment.updateMany({
      where: { clinic: { organizationId } },
      data: { isDeleted: true, deletedAt: new Date() },
    });
  }

  async saveMany(appointments: Appointment[]): Promise<void> {
    const queries = appointments.map((a) => {
      const data = a.toPersistence();
      return this.db.appointment.upsert({
        where: { id: data.id },
        create: data,
        update: data,
      });
    });

    if (txStorage.getStore()?.tx) {
      await Promise.all(queries);
    } else {
      await this.prisma.$transaction(queries);
    }

    appointments.forEach((a) => a.flushEvents());
  }

  async save(appointment: Appointment): Promise<Appointment> {
    const raw = appointment.toPersistence();
    await this.db.appointment.upsert({
      where: { id: raw.id },
      create: raw,
      update: raw,
    });
    appointment.flushEvents();

    return new Appointment(raw);
  }
}
