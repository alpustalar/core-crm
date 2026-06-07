import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetProviderAvailabilityQuery } from './get-provider-availability.query';
import { GetProviderAvailabilityQueryResponse } from './get-provider-availability.response';
import { BadRequestException, Inject } from '@nestjs/common';
import {
  APPOINTMENT_QUERY_REPOSITORY,
  IAppointmentQueryRepository,
} from '@modules/clinical/appointment/domain/repositories/appointment.repository.interface';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/domain/interfaces/policy-factory.interface';
import { ProviderCalendarDayResponse } from '@shared';
import { DateTimeManager } from '@common/utils';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { GetProviderScheduleQuery } from '@modules/clinical/provider/application/queries/get-provider-schedule/get-provider-schedule.query';
import { OperationMode } from '@prisma/client';
import { GetClinicScheduleQuery } from '@modules/organization/clinic/application/queries/get-clinic-schedule/get-clinic-schedule.query';

@QueryHandler(GetProviderAvailabilityQuery)
export class GetProviderAvailabilityHandler
  implements
    IQueryHandler<
      GetProviderAvailabilityQuery,
      GetProviderAvailabilityQueryResponse
    >
{
  constructor(
    private readonly queryBus: TSQueryBus,
    @Inject(APPOINTMENT_QUERY_REPOSITORY)
    private readonly appointmentRepo: IAppointmentQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(
    query: GetProviderAvailabilityQuery
  ): Promise<GetProviderAvailabilityQueryResponse> {
    const { dto, ctx } = query;
    const { actor } = ctx;

    const { providerId, clinicId, startDate, endDate } = dto;

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

    const [clinicScheduleResult, { data: providerSchedule }, occupiedSlots] =
      await Promise.all([
        this.queryBus.execute(
          new GetClinicScheduleQuery(clinicId, startDate, endDate)
        ),
        this.queryBus.execute(
          new GetProviderScheduleQuery(providerId, startDate, endDate)
        ),
        this.appointmentRepo.findProviderOccupiedSlots(
          providerId,
          startDate,
          endDate
        ),
      ]);

    const clinicSchedule = clinicScheduleResult.data;

    const clinicAvailByDay = new Map(
      clinicSchedule.availabilities.map((a) => [a.dayOfWeek, a])
    );
    const clinicExceptionByDate = new Map(
      clinicSchedule.exceptions.map((e) => [
        DateTimeManager.toDateKey(e.date),
        e,
      ])
    );
    const days: ProviderCalendarDayResponse[] = [];
    const cursor = new Date(startDate);
    cursor.setUTCHours(0, 0, 0, 0);

    if (providerSchedule.operationMode === OperationMode.SHIFT) {
      const shiftByDate = new Map(
        providerSchedule.shifts.map((s) => [
          DateTimeManager.toDateKey(s.date),
          s,
        ])
      );

      while (cursor <= endDate) {
        const dateKey = DateTimeManager.toDateKey(cursor);
        const dayOfWeek = cursor.getDay();

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

        const shift = shiftByDate.get(dateKey);

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

        if (!shift || hasFullDayOff) {
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

        const effectiveStartMinute = Math.max(
          clinicAvail.startMinute,
          shift.startMinute
        );
        const effectiveEndMinute = Math.min(
          clinicAvail.endMinute,
          shift.endMinute
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
            breakStartMinute: shift.breakStartMinute ?? null,
            breakEndMinute: shift.breakEndMinute ?? null,
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
    } else {
      const providerAvailByDay = new Map(
        providerSchedule.availabilities.map((a) => [a.dayOfWeek, a])
      );

      while (cursor <= endDate) {
        const dateKey = DateTimeManager.toDateKey(cursor);
        const dayOfWeek = cursor.getDay();

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
    }

    return { data: days };
  }
}
