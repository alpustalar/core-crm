import { Injectable } from '@nestjs/common';
import { Appointment, Prisma } from '@prisma/client';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import {
  CancelAppointmentInput,
  ConflictingAppointment,
  FindByOrganizationIdInput,
  FindClinicCalendarInput,
  FindConflictingAppointmentInput,
  FindProviderCalendarInput,
  IAppointmentRepository,
  OccupiedSlot,
  RescheduleAppointmentInput,
} from '@modules/appointment/domain/repositories/appointment.repository.interface';
import { AppointmentStatusSchema, Pagination } from '@shared';
import { paginate } from '@src/infrastructure/persistence/prisma/helpers/paginate.helper';
import { AppointmentStatusType } from '@input-type-schemas/AppointmentStatusSchema';

@Injectable()
export class AppointmentRepository
  extends BaseRepository
  implements IAppointmentRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findConflictingAppointment({
    providerId,
    startTime,
    endTime,
    ignoreAppointmentId,
  }: FindConflictingAppointmentInput): Promise<ConflictingAppointment | null> {
    return this.db.appointment.findFirst({
      where: {
        providerId,
        isDeleted: false,
        id: ignoreAppointmentId ? { not: ignoreAppointmentId } : undefined,
        status: {
          notIn: [
            AppointmentStatusSchema.enum.CANCELLED,
            AppointmentStatusSchema.enum.NOSHOW,
          ],
        },
        startTime: { lt: endTime },
        endTime: { gt: startTime },
      },
      select: { id: true, startTime: true, endTime: true },
    });
  }

  create(data: Prisma.AppointmentUncheckedCreateInput) {
    return this.db.appointment.create({ data });
  }

  findById(appointmentId: Prisma.AppointmentWhereUniqueInput['id']) {
    return this.db.appointment.findUnique({ where: { id: appointmentId } });
  }

  findProviderCalendar({
    pagination,
    providerId,
    startDate,
    endDate,
  }: FindProviderCalendarInput) {
    return paginate({
      delegate: this.db.appointment,
      pagination,
      where: {
        providerId,
        isDeleted: false,
        startTime: { gte: startDate },
        endTime: { lte: endDate },
      },
      include: { patient: true, treatment: true },
    });
  }

  reschedule(
    appointmentId: Appointment['id'],
    data: RescheduleAppointmentInput
  ) {
    return this.db.appointment.update({
      where: { id: appointmentId },
      data,
    });
  }

  findActionRequired(clinicId: string, pagination: Pagination) {
    return paginate({
      delegate: this.db.appointment,
      pagination,
      where: {
        clinicId,
        isDeleted: false,
        status: {
          not: AppointmentStatusSchema.enum.PENDING,
        }, // Onay bekleyenler
        startTime: { gte: new Date() },
      },
      include: { patient: true, treatment: true },
    });
  }

  async getProviderDailyLoad(providerId: string, date: Date) {
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    const count = await this.db.appointment.count({
      where: {
        providerId,
        isDeleted: false,
        startTime: { gte: startOfDay, lte: endOfDay },
        status: { not: AppointmentStatusSchema.enum.CANCELLED },
      },
    });

    return { providerId, date, appointmentCount: count };
  }

  findUpcomingReminders(pagination: Pagination, hoursAhead: number = 24) {
    const now = new Date();
    const targetDate = new Date();
    targetDate.setHours(targetDate.getHours() + hoursAhead);

    return paginate({
      delegate: this.db.appointment,
      pagination,
      where: {
        isDeleted: false,
        status: AppointmentStatusSchema.enum.CONFIRMED,
        startTime: { gte: now, lte: targetDate },
      },
      include: { patient: true },
    });
  }

  findByPatientId(pagination: Pagination, patientId: string) {
    return paginate({
      delegate: this.db.appointment,
      pagination,
      where: { patientId, isDeleted: false },
      include: { provider: true, treatment: true },
    });
  }

  changeStatusById(
    appointmentId: Appointment['id'],
    status: AppointmentStatusType
  ) {
    return this.db.appointment.update({
      where: { id: appointmentId, isDeleted: false },
      data: { status },
    });
  }

  changeStatusByProviderId(
    providerId: Appointment['providerId'],
    status: AppointmentStatusType
  ) {
    return this.db.appointment.updateMany({
      where: { providerId, isDeleted: false },
      data: { status },
    });
  }

  changeStatusByClinicId(
    clinicId: Appointment['clinicId'],
    status: AppointmentStatusType
  ) {
    return this.db.appointment.updateMany({
      where: { clinicId, isDeleted: false },
      data: { status },
    });
  }

  softDeleteAllAppointmentsByClinicId(
    clinicId: Prisma.AppointmentWhereInput['clinicId']
  ) {
    return this.db.appointment.updateMany({
      where: { clinicId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  softDeleteAllByOrganizationId(organizationId: string) {
    return this.db.appointment.updateMany({
      where: { clinic: { organizationId } },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  softDeleteAllByProviderId(providerId: Appointment['providerId']) {
    return this.db.appointment.updateMany({
      where: { providerId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  cancelById(appointmentId: Appointment['id'], data: CancelAppointmentInput) {
    return this.db.appointment.update({
      where: { id: appointmentId, isDeleted: false },
      data: {
        status: 'CANCELLED',
        canceledAt: new Date(),
        canceledBy: data.canceledBy,
        cancelReason: data.cancelReason,
      },
    });
  }

  findByIdWithDetails(appointmentId: Appointment['id']) {
    return this.db.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: true,
        provider: { include: { user: true } },
        treatment: true,
        clinic: true,
      },
    });
  }

  findClinicCalendar({
    clinicId,
    startDate,
    endDate,
    pagination,
  }: FindClinicCalendarInput) {
    return paginate({
      delegate: this.db.appointment,
      pagination,
      where: {
        clinicId,
        isDeleted: false,
        startTime: { gte: startDate },
        endTime: { lte: endDate },
      },
      include: {
        provider: { include: { user: true } },
        patient: true,
        treatment: true,
      },
    });
  }

  findByOrganizationId({
    organizationId,
    pagination,
    clinicId,
    status,
    startDate,
    endDate,
  }: FindByOrganizationIdInput) {
    return paginate({
      delegate: this.db.appointment,
      pagination,
      where: {
        isDeleted: false,
        clinic: { organizationId },
        clinicId,
        status,
        startTime:
          (startDate ?? endDate) ? { gte: startDate, lte: endDate } : undefined,
      },
      include: {
        provider: { include: { user: true } },
        patient: true,
        treatment: true,
        clinic: true,
      },
    });
  }

  findProviderOccupiedSlots(
    providerId: string,
    startDate: Date,
    endDate: Date
  ): Promise<OccupiedSlot[]> {
    return this.db.appointment.findMany({
      where: {
        providerId,
        isDeleted: false,
        status: {
          notIn: [
            AppointmentStatusSchema.enum.CANCELLED,
            AppointmentStatusSchema.enum.NOSHOW,
          ],
        },
        startTime: { lt: endDate },
        endTime: { gt: startDate },
      },
      select: { id: true, startTime: true, endTime: true, status: true },
      orderBy: { startTime: 'asc' },
    });
  }
}
