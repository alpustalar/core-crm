import { Injectable } from '@nestjs/common';
import { Appointment, AppointmentStatusSchema, Pagination } from '@shared';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { paginate } from '@src/infrastructure/persistence/prisma/helpers/paginate.helper';
import { IAppointmentQueryRepository } from '@modules/clinical/appointment/domain/repositories/appointment.repository.interface';
import { DateTimeManager } from '@common/utils';
import {
  AppointmentWithDetails,
  ClinicCalendarEventRow,
  ClinicStatusCount,
  ConflictingAppointment,
  ConflictingAppointmentView,
  FindByOrganizationIdData,
  FindClinicCalendarData,
  FindClinicCalendarEventsData,
  FindClinicDailyCountsData,
  FindConflictingAppointmentData,
  FindProviderCalendarData,
  FindUpcomingRemindersData,
  FindWaitingRoomData,
  OccupiedSlot,
  ProviderDailyLoad,
  SearchClinicAppointmentsData,
  WaitingRoomRow,
} from '@modules/clinical/appointment/domain/contracts/appointment.contracts';
import { Paginated } from '@common/interfaces/paginated.type';

@Injectable()
export class AppointmentQueryRepository
  extends BaseRepository
  implements IAppointmentQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findById(appointmentId: string): Promise<Appointment | null> {
    return this.db.appointment.findUnique({
      where: { id: appointmentId },
    });
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

  // Çakışma görünürlüğü: aynı doktorda verilen aralıkla çakışan (iptal/gelmedi hariç)
  // tüm randevular. ENGELLEMEZ — yalnız personele gösterim için hafif projeksiyon.
  findConflictingAppointments({
    providerId,
    startTime,
    endTime,
    ignoreAppointmentId,
  }: FindConflictingAppointmentData): Promise<ConflictingAppointmentView[]> {
    return this.db.appointment.findMany({
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
      select: {
        id: true,
        patientName: true,
        startTime: true,
        endTime: true,
        status: true,
      },
      orderBy: { startTime: 'asc' },
    });
  }

  findProviderCalendar({
    pagination,
    providerId,
    startDate,
    endDate,
  }: FindProviderCalendarData): Promise<Paginated<Appointment>> {
    return paginate({
      delegate: this.db.appointment,
      pagination,
      where: {
        providerId,
        isDeleted: false,
        startTime: { gte: startDate },
        endTime: { lte: endDate },
      },
    });
  }

  findClinicCalendar({
    clinicId,
    startDate,
    endDate,
    pagination,
    providerId,
    status,
  }: FindClinicCalendarData): Promise<Paginated<Appointment>> {
    return paginate({
      delegate: this.db.appointment,
      pagination,
      where: {
        clinicId,
        isDeleted: false,
        providerId,
        status,
        startTime: { gte: startDate },
        endTime: { lte: endDate },
      },
    });
  }

  // Tam takvim: aralıktaki tüm randevular (sayfasız, hafif projeksiyon). Randevu,
  // başlangıç zamanına göre aralığa girer; providerId verilirse tek doktora daralır.
  findClinicCalendarEvents({
    clinicId,
    startDate,
    endDate,
    providerId,
    status,
  }: FindClinicCalendarEventsData): Promise<ClinicCalendarEventRow[]> {
    return this.db.appointment.findMany({
      where: {
        clinicId,
        isDeleted: false,
        providerId: providerId ?? undefined,
        status,
        startTime: { gte: startDate, lte: endDate },
      },
      select: {
        id: true,
        providerId: true,
        patientId: true,
        patientName: true,
        patientPhone: true,
        startTime: true,
        endTime: true,
        status: true,
        treatmentType: true,
        isConsultation: true,
      },
      orderBy: { startTime: 'asc' },
    });
  }

  findByOrganizationId({
    organizationId,
    pagination,
    clinicId,
    status,
    startDate,
    endDate,
  }: FindByOrganizationIdData): Promise<Paginated<Appointment>> {
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
    });
  }

  findByPatientId(
    pagination: Pagination,
    patientId: string
  ): Promise<Paginated<Appointment>> {
    return paginate({
      delegate: this.db.appointment,
      pagination,
      where: { patientId, isDeleted: false },
    });
  }

  findActionRequired(
    clinicId: string,
    pagination: Pagination
  ): Promise<Paginated<Appointment>> {
    return paginate({
      delegate: this.db.appointment,
      pagination,
      where: {
        clinicId,
        isDeleted: false,
        status: { not: AppointmentStatusSchema.enum.PENDING },
        startTime: { gte: DateTimeManager.create() },
      },
    });
  }

  // Resepsiyon: ad/telefon (case-insensitive contains) + opsiyonel status/doktor/tarih
  // aralığı ile klinik randevu araması. clinicId aktörün kliniğidir (handler geçirir).
  searchClinicAppointments({
    clinicId,
    pagination,
    search,
    status,
    providerId,
    startDate,
    endDate,
  }: SearchClinicAppointmentsData): Promise<Paginated<Appointment>> {
    return paginate({
      delegate: this.db.appointment,
      pagination,
      where: {
        clinicId,
        isDeleted: false,
        status,
        providerId,
        startTime:
          (startDate ?? endDate) ? { gte: startDate, lte: endDate } : undefined,
        ...(search
          ? {
              OR: [
                { patientName: { contains: search, mode: 'insensitive' } },
                { patientPhone: { contains: search } },
              ],
            }
          : {}),
      },
    });
  }

  async findUpcomingReminders({
    clinicId,
    pagination,
    hoursAhead = 24,
  }: FindUpcomingRemindersData): Promise<Paginated<Appointment>> {
    const now = DateTimeManager.create();

    return await paginate({
      delegate: this.db.appointment,
      pagination,
      where: {
        clinicId,
        isDeleted: false,
        status: AppointmentStatusSchema.enum.CONFIRMED,
        startTime: { gte: now, lte: DateTimeManager.addHours(now, hoursAhead) },
      },
    });
  }

  // Resepsiyon günlük özeti: gün sınırları handler'da klinik yerelinde hesaplanır,
  // burada yalnız status bazlı sayım yapılır (tek groupBy sorgusu).
  async countClinicAppointmentsByStatus({
    clinicId,
    providerId,
    dayStart,
    dayEnd,
  }: FindClinicDailyCountsData): Promise<ClinicStatusCount[]> {
    const rows = await this.db.appointment.groupBy({
      by: ['status'],
      where: {
        clinicId,
        isDeleted: false,
        providerId,
        startTime: { gte: dayStart, lte: dayEnd },
      },
      _count: { _all: true },
    });
    return rows.map((r) => ({ status: r.status, count: r._count._all }));
  }

  async findUpcomingPendingApproval(
    clinicId: string,
    pagination: Pagination
  ): Promise<Paginated<Appointment>> {
    return await paginate({
      delegate: this.db.appointment,
      pagination,
      where: {
        clinicId,
        isDeleted: false,
        status: AppointmentStatusSchema.enum.PENDING,
        startTime: { gte: DateTimeManager.create() },
      },
    });
  }

  // Hastanın aktif (gelecek + iptal/tamamlanmamış) randevu sayısı — hasta kanalı
  // booking'lerinde maxActivePatientBookings sınırını denetlemek için.
  countActiveByPatient(patientId: string): Promise<number> {
    return this.db.appointment.count({
      where: {
        patientId,
        isDeleted: false,
        status: {
          in: [
            AppointmentStatusSchema.enum.PENDING,
            AppointmentStatusSchema.enum.CONFIRMED,
          ],
        },
        startTime: { gte: DateTimeManager.create() },
      },
    });
  }

  // Bekleme odası: kliniğe gelmiş (ARRIVED) hastalar, geliş sırasına göre (checkedInAt).
  findWaitingRoom({
    clinicId,
    providerId,
  }: FindWaitingRoomData): Promise<WaitingRoomRow[]> {
    return this.db.appointment.findMany({
      where: {
        clinicId,
        isDeleted: false,
        status: AppointmentStatusSchema.enum.ARRIVED,
        providerId: providerId ?? undefined,
      },
      select: {
        id: true,
        providerId: true,
        patientId: true,
        patientName: true,
        patientPhone: true,
        startTime: true,
        checkedInAt: true,
        treatmentType: true,
      },
      orderBy: { checkedInAt: 'asc' },
    });
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
