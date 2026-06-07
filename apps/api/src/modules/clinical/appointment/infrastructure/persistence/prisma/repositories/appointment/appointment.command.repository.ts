import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { BaseCommandRepository } from '@src/infrastructure/persistence/prisma/base-command.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { AppointmentStatusType } from '@input-type-schemas/AppointmentStatusSchema';
import { Appointment } from '@modules/clinical/appointment/domain/entities/appointment.entity';
import { IAppointmentCommandRepository } from '@modules/clinical/appointment/domain/repositories/appointment.repository.interface';
import { RescheduleAppointmentProps } from '@modules/clinical/appointment/domain/types/reschedule-appointment.props';
import { CancelAppointmentProps } from '@modules/clinical/appointment/domain/types/cancel-appointment.props';
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

  async create(
    data: Prisma.AppointmentUncheckedCreateInput
  ): Promise<Appointment> {
    const raw = await this.db.appointment.create({ data });
    return new Appointment(raw);
  }

  async reschedule(
    appointmentId: string,
    data: RescheduleAppointmentProps
  ): Promise<Appointment> {
    const raw = await this.db.appointment.update({
      where: { id: appointmentId },
      data,
    });
    return new Appointment(raw);
  }

  async cancelById(
    appointmentId: string,
    data: CancelAppointmentProps
  ): Promise<Appointment> {
    const raw = await this.db.appointment.update({
      where: { id: appointmentId, isDeleted: false },
      data: {
        status: 'CANCELLED',
        canceledAt: new Date(),
        canceledBy: data.canceledBy,
        cancelReason: data.cancelReason,
      },
    });
    return new Appointment(raw);
  }

  async changeStatusById(
    appointmentId: string,
    status: AppointmentStatusType
  ): Promise<Appointment> {
    const raw = await this.db.appointment.update({
      where: { id: appointmentId, isDeleted: false },
      data: { status },
    });
    return new Appointment(raw);
  }

  async changeStatusByProviderId(
    providerId: string,
    status: AppointmentStatusType
  ): Promise<BatchPayload> {
    return this.db.appointment.updateMany({
      where: { providerId, isDeleted: false },
      data: { status },
    });
  }

  async changeStatusByClinicId(
    clinicId: string,
    status: AppointmentStatusType
  ): Promise<BatchPayload> {
    return this.db.appointment.updateMany({
      where: { clinicId, isDeleted: false },
      data: { status },
    });
  }

  async softDeleteAllAppointmentsByClinicId(
    clinicId: Prisma.AppointmentWhereInput['clinicId']
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

  async softDeleteAllByProviderId(providerId: string): Promise<BatchPayload> {
    return this.db.appointment.updateMany({
      where: { providerId },
      data: { isDeleted: true, deletedAt: new Date() },
    });
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

  async saveMany(appointments: Appointment[]): Promise<void> {
    const prismaQueries = appointments.map((appointment) => {
      const data = appointment.toPersistence();
      return this.db.appointment.upsert({
        where: { id: data.id },
        create: data,
        update: data,
      });
    });

    if (txStorage.getStore()?.tx) {
      await Promise.all(prismaQueries);
    } else {
      await this.prisma.$transaction(prismaQueries);
    }

    appointments.forEach((appointment) => appointment.flushEvents());
  }
}
