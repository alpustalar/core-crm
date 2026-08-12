import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetProviderAvailabilityQuery } from './get-provider-availability.query';
import { GetProviderAvailabilityQueryResponse } from './get-provider-availability.response';
import { Inject } from '@nestjs/common';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { ProviderCalendarDayResponse, ProviderException } from '@shared';
import { DateTimeManager } from '@common/utils';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { GetProviderScheduleQuery } from '@modules/clinical/provider/application/queries/get-provider-schedule/get-provider-schedule.query';
import { GetClinicScheduleQuery } from '@modules/organization/clinic/application/queries/get-clinic-schedule/get-clinic-schedule.query';
import { OperationModeSchema } from '@input-type-schemas/OperationModeSchema';
import { ExceptionTypeSchema } from '@input-type-schemas/ExceptionTypeSchema';
import { DateRange } from '@src/domain/value-objects/date-range.vo';
import { FindClinicIdByProviderIdQuery } from '@modules/organization/clinic/application/queries/find-clinic-id-by-provider-id/find-clinic-id-by-provider-id.query';
import { ExecutionContextFactory } from '@src/domain/common/execution/execution-context.factory';
import {
  APPOINTMENT_QUERY_REPOSITORY,
  IAppointmentQueryRepository,
} from '@modules/clinical/appointment/domain/repositories/appointment';

@QueryHandler(GetProviderAvailabilityQuery)
export class GetProviderAvailabilityHandler
  implements
    IQueryHandler<
      GetProviderAvailabilityQuery,
      GetProviderAvailabilityQueryResponse
    >
{
  private readonly internalCtx = ExecutionContextFactory.createInternal();
  constructor(
    private readonly queryBus: TSQueryBus,
    @Inject(APPOINTMENT_QUERY_REPOSITORY)
    private readonly appointmentQueryRepository: IAppointmentQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(
    query: GetProviderAvailabilityQuery
  ): Promise<GetProviderAvailabilityQueryResponse> {
    const { actor, source } = query.ctx;
    const { providerId, startDate, endDate } = query.filter;

    const { clinicId } = await this.queryBus.execute(
      new FindClinicIdByProviderIdQuery(providerId)
    );

    const serializationOptions = this.policyFactory
      .appointment(actor, source)
      .policy.getSerializationOptions({ clinicId, providerId });

    const providerAvailabilityQueryDateRange = DateRange.create(
      startDate,
      endDate
    ).orThrow();

    const [
      { data: clinicSchedule },
      { data: providerSchedule },
      occupiedSlots,
    ] = await Promise.all([
      this.queryBus.execute(
        new GetClinicScheduleQuery({
          clinicId,
          startDate: providerAvailabilityQueryDateRange.startDate,
          endDate: providerAvailabilityQueryDateRange.endDate,
        })
      ),
      this.queryBus.execute(
        new GetProviderScheduleQuery({
          providerId,
          startDate: providerAvailabilityQueryDateRange.startDate,
          endDate: providerAvailabilityQueryDateRange.endDate,
          ctx: this.internalCtx,
        })
      ),
      this.appointmentQueryRepository.findProviderOccupiedSlots(
        providerId,
        providerAvailabilityQueryDateRange.startDate,
        providerAvailabilityQueryDateRange.endDate
      ),
    ]);

    const clinicAvailabilityByDay = new Map(
      clinicSchedule.availabilities.map((availability) => [
        availability.dayOfWeek,
        availability,
      ])
    );
    const clinicExceptionByDate = new Map(
      clinicSchedule.exceptions.map((exception) => [
        DateTimeManager.toDateKey(exception.date),
        exception,
      ])
    );
    const days: ProviderCalendarDayResponse[] = [];
    // Gün gün ilerlerken haftanın günü (dayOfWeek), tarih anahtarı (dateKey) ve
    // gün sınırları hepsi aynı timezone'da (klinik yereli — DEFAULT_TZ) hesaplanır.
    // Native getDay()/setUTCDate karışımı kaldırıldı; aksi halde sunucu UTC iken
    // dateKey ile dayOfWeek farklı güne düşüp yanlış klinik müsaitliği eşleşiyordu.
    const rangeStart = DateTimeManager.startOfDay(
      providerAvailabilityQueryDateRange.startDate
    );
    const rangeEnd = providerAvailabilityQueryDateRange.endDate;

    if (providerSchedule.operationMode === OperationModeSchema.enum.SHIFT) {
      const shiftByDate = new Map(
        providerSchedule.shifts.map((shift) => [
          DateTimeManager.toDateKey(shift.date),
          shift,
        ])
      );

      for (
        let cursor = rangeStart;
        cursor <= rangeEnd;
        cursor = DateTimeManager.addDays(cursor, 1)
      ) {
        const dateKey = DateTimeManager.toDateKey(cursor);
        const dayOfWeek = DateTimeManager.getDayOfWeek(cursor);

        const clinicAvailability = clinicAvailabilityByDay.get(dayOfWeek);
        const clinicException = clinicExceptionByDate.get(dateKey);
        const clinicClosed =
          !clinicAvailability ||
          clinicAvailability.isClosed ||
          clinicException?.isClosed;

        if (clinicClosed) {
          days.push({
            date: dateKey,
            isWorkingDay: false,
            reason: clinicException?.reason ?? null,
            workingHours: null,
            providerExceptions: [],
            occupiedSlots: [],
          });
          continue;
        }

        const shift = shiftByDate.get(dateKey);

        const dayStart = DateTimeManager.startOfDay(cursor);
        const dayEnd = DateTimeManager.endOfDay(cursor);

        const cursorRange = DateRange.fromTrusted(dayStart, dayEnd);

        const dayProviderExceptions = providerSchedule.exceptions.filter(
          (exception) => {
            const exceptionRange = DateRange.fromTrusted(
              exception.startTime,
              exception.endTime
            );
            // Guard.value = "çakışma yok"; gün ile çakışan istisnaları tutmak için tersle.
            return !exceptionRange.validate.isOverlappingWith(cursorRange)
              .value;
          }
        );

        const hasFullDayOff = this.hasFullDayOf(
          dayProviderExceptions,
          cursorRange
        );

        if (!shift || hasFullDayOff) {
          days.push({
            date: dateKey,
            isWorkingDay: false,
            reason: null,
            workingHours: null,
            providerExceptions: dayProviderExceptions.map((exception) => ({
              startTime: exception.startTime,
              endTime: exception.endTime,
              type: exception.type,
              reason: exception.reason ?? null,
            })),
            occupiedSlots: [],
          });
          continue;
        }

        const effectiveStartMinute = Math.max(
          clinicAvailability.startMinute,
          shift.startMinute
        );
        const effectiveEndMinute = Math.min(
          clinicAvailability.endMinute,
          shift.endMinute
        );

        const dayOccupiedSlots = occupiedSlots.filter(
          (occupiedSlot) =>
            occupiedSlot.startTime < dayEnd && occupiedSlot.endTime > dayStart
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
          providerExceptions: dayProviderExceptions.map((exception) => ({
            startTime: exception.startTime,
            endTime: exception.endTime,
            type: exception.type,
            reason: exception.reason ?? null,
          })),
          occupiedSlots: dayOccupiedSlots.map((occupiedSlot) => ({
            id: occupiedSlot.id,
            startTime: occupiedSlot.startTime,
            endTime: occupiedSlot.endTime,
            status: occupiedSlot.status,
          })),
        });
      }
    } else {
      const providerAvailByDay = new Map(
        providerSchedule.availabilities.map((availability) => [
          availability.dayOfWeek,
          availability,
        ])
      );

      for (
        let cursor = rangeStart;
        cursor <= rangeEnd;
        cursor = DateTimeManager.addDays(cursor, 1)
      ) {
        const dateKey = DateTimeManager.toDateKey(cursor);
        const dayOfWeek = DateTimeManager.getDayOfWeek(cursor);

        const clinicAvailability = clinicAvailabilityByDay.get(dayOfWeek);
        const clinicException = clinicExceptionByDate.get(dateKey);
        const clinicClosed =
          !clinicAvailability ||
          clinicAvailability.isClosed ||
          clinicException?.isClosed;

        if (clinicClosed) {
          days.push({
            date: dateKey,
            isWorkingDay: false,
            reason: clinicException?.reason ?? null,
            workingHours: null,
            providerExceptions: [],
            occupiedSlots: [],
          });
          continue;
        }

        const providerAvail = providerAvailByDay.get(dayOfWeek);

        const dayStart = DateTimeManager.startOfDay(cursor);
        const dayEnd = DateTimeManager.endOfDay(cursor);

        const cursorRange = DateRange.fromTrusted(dayStart, dayEnd);

        const dayProviderExceptions = providerSchedule.exceptions.filter(
          (exception) => {
            const exceptionRange = DateRange.fromTrusted(
              exception.startTime,
              exception.endTime
            );

            // Guard.value = "çakışma yok"; gün ile çakışan istisnaları tutmak için tersle.
            return !exceptionRange.validate.isOverlappingWith(cursorRange)
              .value;
          }
        );

        const hasFullDayOff = this.hasFullDayOf(
          dayProviderExceptions,
          cursorRange
        );

        if (!providerAvail || hasFullDayOff) {
          days.push({
            date: dateKey,
            isWorkingDay: false,
            reason: null,
            workingHours: null,
            providerExceptions: dayProviderExceptions.map((exception) => ({
              startTime: exception.startTime,
              endTime: exception.endTime,
              type: exception.type,
              reason: exception.reason ?? null,
            })),
            occupiedSlots: [],
          });
          continue;
        }

        const effectiveStartMinute = Math.max(
          clinicAvailability.startMinute,
          providerAvail.startMinute
        );
        const effectiveEndMinute = Math.min(
          clinicAvailability.endMinute,
          providerAvail.endMinute
        );

        const dayOccupiedSlots = occupiedSlots.filter(
          (occupiedSlot) =>
            occupiedSlot.startTime < dayEnd && occupiedSlot.endTime > dayStart
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
          providerExceptions: dayProviderExceptions.map((exception) => ({
            startTime: exception.startTime,
            endTime: exception.endTime,
            type: exception.type,
            reason: exception.reason ?? null,
          })),
          occupiedSlots: dayOccupiedSlots.map((occupiedSlot) => ({
            id: occupiedSlot.id,
            startTime: occupiedSlot.startTime,
            endTime: occupiedSlot.endTime,
            status: occupiedSlot.status,
          })),
        });
      }
    }

    return { data: days, meta: { serializationOptions } };
  }

  private hasFullDayOf(exceptions: ProviderException[], dateRange: DateRange) {
    return exceptions.some((exception) => {
      if (exception.type !== ExceptionTypeSchema.enum.OFF) return false;

      const exceptionRange = DateRange.fromTrusted(
        exception.startTime,
        exception.endTime
      );
      return dateRange.validate.isEnclosingWith(exceptionRange).value;
    });
  }
}
