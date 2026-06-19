import { Injectable } from '@nestjs/common';
import { AppointmentStatusSchema, Pagination } from '@shared';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { paginate } from '@src/infrastructure/persistence/prisma/helpers/paginate.helper';
import { Appointment } from '@modules/clinical/appointment/domain/entities/appointment.entity';
import { IAppointmentQueryRepository } from '@modules/clinical/appointment/domain/repositories/appointment.repository.interface';
import { DateTimeManager } from '@common/utils';
import {
  AppointmentWithDetails,
  ConflictingAppointment,
  FindByOrganizationIdData,
  FindClinicCalendarData,
  FindConflictingAppointmentData,
  FindProviderCalendarData,
  OccupiedSlot,
  PaginatedAppointments,
  ProviderDailyLoad,
} from '@modules/clinical/appointment/domain/appointment.contracts';

@Injectable()
export class AppointmentQueryRepository
  extends BaseRepository
  implements IAppointmentQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(appointmentId: string): Promise<Appointment | null> {
    const raw = await this.db.appointment.findUnique({
      where: { id: appointmentId },
    });
    return raw ? new Appointment(raw) : null;
  }

  findByIdWithDetails(
    appointmentId: string
  ): Promise<AppointmentWithDetails | null> {
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

  findConflictingAppointment({
    providerId,
    startTime,
    endTime,
    ignoreAppointmentId,
  }: FindConflictingAppointmentData): Promise<ConflictingAppointment | null> {
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

  async findProviderCalendar({
    pagination,
    providerId,
    startDate,
    endDate,
  }: FindProviderCalendarData): PaginatedAppointments {
    const result = await paginate({
      delegate: this.db.appointment,
      pagination,
      where: {
        providerId,
        isDeleted: false,
        startTime: { gte: startDate },
        endTime: { lte: endDate },
      },
    });
    return {
      items: result.items.map((r) => new Appointment(r)),
      total: result.total,
    };
  }

  async findClinicCalendar({
    clinicId,
    startDate,
    endDate,
    pagination,
  }: FindClinicCalendarData): PaginatedAppointments {
    const result = await paginate({
      delegate: this.db.appointment,
      pagination,
      where: {
        clinicId,
        isDeleted: false,
        startTime: { gte: startDate },
        endTime: { lte: endDate },
      },
    });
    return {
      items: result.items.map((r) => new Appointment(r)),
      total: result.total,
    };
  }

  async findByOrganizationId({
    organizationId,
    pagination,
    clinicId,
    status,
    startDate,
    endDate,
  }: FindByOrganizationIdData): PaginatedAppointments {
    const result = await paginate({
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
    });
    return {
      items: result.items.map((r) => new Appointment(r)),
      total: result.total,
    };
  }

  async findByPatientId(
    pagination: Pagination,
    patientId: string
  ): PaginatedAppointments {
    const result = await paginate({
      delegate: this.db.appointment,
      pagination,
      where: { patientId, isDeleted: false },
    });
    return {
      items: result.items.map((r) => new Appointment(r)),
      total: result.total,
    };
  }

  async findActionRequired(
    clinicId: string,
    pagination: Pagination
  ): PaginatedAppointments {
    const result = await paginate({
      delegate: this.db.appointment,
      pagination,
      where: {
        clinicId,
        isDeleted: false,
        status: { not: AppointmentStatusSchema.enum.PENDING },
        startTime: { gte: new Date() },
      },
    });
    return {
      items: result.items.map((r) => new Appointment(r)),
      total: result.total,
    };
  }

  async findUpcomingReminders(
    pagination: Pagination,
    hoursAhead: number = 24
  ): PaginatedAppointments {
    const now = new Date();
    const result = await paginate({
      delegate: this.db.appointment,
      pagination,
      where: {
        isDeleted: false,
        status: AppointmentStatusSchema.enum.CONFIRMED,
        startTime: { gte: now, lte: DateTimeManager.addHours(now, hoursAhead) },
      },
    });
    return {
      items: result.items.map((r) => new Appointment(r)),
      total: result.total,
    };
  }

  async getProviderDailyLoad(
    providerId: string,
    date: Date
  ): Promise<ProviderDailyLoad> {
    const count = await this.db.appointment.count({
      where: {
        providerId,
        isDeleted: false,
        startTime: {
          gte: DateTimeManager.startOfDay(date),
          lte: DateTimeManager.endOfDay(date),
        },
        status: { not: AppointmentStatusSchema.enum.CANCELLED },
      },
    });
    return { providerId, date, appointmentCount: count };
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
