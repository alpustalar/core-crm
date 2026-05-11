import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  APPOINTMENT_REPO_TOKEN,
  IAppointmentRepository,
} from '@modules/appointment/domain/repositories/appointment.repository.interface';
import { ClinicModuleApi } from '@modules/clinic/clinic-module.api';
import { ProviderModuleApi } from '@modules/provider/provider-module.api';
import { PolicyFactory } from '@modules/policy/application/policy-factory';
import { ActorContext } from '@common/interfaces';
import { ProviderCalendarDayResponse, ProviderCalendarResponse } from '@shared';

interface GetProviderAvailabilityCalendarInput {
  providerId: string;
  clinicId: string;
  startDate: Date;
  endDate: Date;
}

@Injectable()
export class GetProviderAvailabilityCalendarUseCase {
  constructor(
    @Inject(APPOINTMENT_REPO_TOKEN)
    private readonly appointmentRepo: IAppointmentRepository,
    private readonly clinicModuleApi: ClinicModuleApi,
    private readonly providerModuleApi: ProviderModuleApi,
    private readonly policyFactory: PolicyFactory
  ) {}

  async execute(
    input: GetProviderAvailabilityCalendarInput,
    actor: ActorContext
  ): Promise<ProviderCalendarResponse> {
    const { providerId, clinicId, startDate, endDate } = input;

    this.policyFactory
      .appointment(actor)
      .evaluator.check(
        (p) => p.canScheduleAppointmentInClinic(clinicId),
        'Bu kliniğe ait takvime erişim yetkiniz yok.'
      )
      .orThrow();

    if (startDate >= endDate) {
      throw new BadRequestException(
        'Başlangıç tarihi bitiş tarihinden önce olmalıdır.'
      );
    }

    const [clinicSchedule, providerSchedule, occupiedSlots] = await Promise.all(
      [
        this.clinicModuleApi.findSchedule({ clinicId, startDate, endDate }),
        this.providerModuleApi.findSchedule({ providerId, startDate, endDate }),
        this.appointmentRepo.findProviderOccupiedSlots(
          providerId,
          startDate,
          endDate
        ),
      ]
    );

    const clinicAvailByDay = new Map(
      clinicSchedule.availabilities.map((a) => [a.dayOfWeek, a])
    );
    const clinicExceptionByDate = new Map(
      clinicSchedule.exceptions.map((e) => [toDateKey(e.date), e])
    );
    const providerAvailByDay = new Map(
      providerSchedule.availabilities.map((a) => [a.dayOfWeek, a])
    );

    const days: ProviderCalendarDayResponse[] = [];
    const cursor = new Date(startDate);
    cursor.setUTCHours(0, 0, 0, 0);

    while (cursor <= endDate) {
      const dateKey = toDateKey(cursor);
      const dayOfWeek = cursor.getDay();

      // --- Clinic check ---
      const clinicAvail = clinicAvailByDay.get(dayOfWeek);
      const clinicException = clinicExceptionByDate.get(dateKey);
      const clinicClosed =
        !clinicAvail || clinicAvail.isClosed || clinicException?.isClosed;

      if (clinicClosed) {
        days.push({
          date: dateKey,
          isWorkingDay: false,
          reason: clinicException?.reason ?? null,
          workingHours: null,
          providerExceptions: [],
          occupiedSlots: [],
        });
        cursor.setUTCDate(cursor.getUTCDate() + 1);
        continue;
      }

      // --- Provider check ---
      const providerAvail = providerAvailByDay.get(dayOfWeek);

      const dayStart = new Date(cursor);
      const dayEnd = new Date(cursor);
      dayEnd.setUTCHours(23, 59, 59, 999);

      const dayProviderExceptions = providerSchedule.exceptions.filter(
        (e) => e.startTime < dayEnd && e.endTime > dayStart
      );

      const hasFullDayOff = dayProviderExceptions.some(
        (e) =>
          e.type === 'OFF' && e.startTime <= dayStart && e.endTime >= dayEnd
      );

      if (!providerAvail || hasFullDayOff) {
        days.push({
          date: dateKey,
          isWorkingDay: false,
          reason: null,
          workingHours: null,
          providerExceptions: dayProviderExceptions.map((e) => ({
            startTime: e.startTime,
            endTime: e.endTime,
            type: e.type,
            reason: e.reason ?? null,
          })),
          occupiedSlots: [],
        });
        cursor.setUTCDate(cursor.getUTCDate() + 1);
        continue;
      }

      // --- Working hours: intersection of clinic and provider ---
      const effectiveStartMinute = Math.max(
        clinicAvail.startMinute,
        providerAvail.startMinute
      );
      const effectiveEndMinute = Math.min(
        clinicAvail.endMinute,
        providerAvail.endMinute
      );

      const dayOccupiedSlots = occupiedSlots.filter(
        (s) => s.startTime < dayEnd && s.endTime > dayStart
      );

      days.push({
        date: dateKey,
        isWorkingDay: true,
        reason: null,
        workingHours: {
          startMinute: effectiveStartMinute,
          endMinute: effectiveEndMinute,
          breakStartMinute: providerAvail.breakStartMinute ?? null,
          breakEndMinute: providerAvail.breakEndMinute ?? null,
        },
        providerExceptions: dayProviderExceptions.map((e) => ({
          startTime: e.startTime,
          endTime: e.endTime,
          type: e.type,
          reason: e.reason ?? null,
        })),
        occupiedSlots: dayOccupiedSlots.map((s) => ({
          id: s.id,
          startTime: s.startTime,
          endTime: s.endTime,
          status: s.status,
        })),
      });

      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    return { days };
  }
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}
