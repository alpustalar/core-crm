import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  IProviderQueryRepository,
  PROVIDER_QUERY_REPOSITORY,
} from '@modules/clinical/provider/domain/repositories/provider.repository.interface';
import { ProviderSchedule } from '@modules/clinical/provider/domain/value-objects/provider-schedule.vo';
import { AssertProviderCanBookQuery } from './assert-provider-can-book.query';
import { DateTimeManager } from '@common/utils';
import { ProviderNotFoundException } from '@modules/clinical/provider/domain/exceptions/provider.exceptions';
import {
  IProviderExceptionQueryRepository,
  PROVIDER_EXCEPTION_QUERY_REPOSITORY,
} from '@modules/clinical/provider/domain/repositories/provider-exception.repository.interface';
import {
  IProviderAvailabilityQueryRepository,
  PROVIDER_AVAILABILITY_QUERY_REPOSITORY,
} from '@modules/clinical/provider/domain/repositories/provider-availability.repository.interface';
import {
  IProviderShiftQueryRepository,
  PROVIDER_SHIFT_QUERY_REPOSITORY,
} from '@modules/clinical/provider/domain/repositories/provider-shift.repository.interface';
import { ProviderShiftNotFoundException } from '@modules/clinical/provider/domain/exceptions/provider-shift.exceptions';
import { DayMinuteRange } from '@src/domain/value-objects/day-minute-range.vo';
import { DateRange } from '@src/domain/value-objects/date-range.vo';
import { DayMinute } from '@src/domain/value-objects/day-minute.vo';

@QueryHandler(AssertProviderCanBookQuery)
export class AssertProviderCanBookHandler
  implements IQueryHandler<AssertProviderCanBookQuery, void>
{
  constructor(
    @Inject(PROVIDER_EXCEPTION_QUERY_REPOSITORY)
    private readonly providerExceptionRepo: IProviderExceptionQueryRepository,
    @Inject(PROVIDER_QUERY_REPOSITORY)
    private readonly providerQueryRepo: IProviderQueryRepository,
    @Inject(PROVIDER_AVAILABILITY_QUERY_REPOSITORY)
    private readonly providerAvailabilityQueryRepo: IProviderAvailabilityQueryRepository,
    @Inject(PROVIDER_SHIFT_QUERY_REPOSITORY)
    private readonly providerShiftQueryRepo: IProviderShiftQueryRepository
  ) {}

  async execute(query: AssertProviderCanBookQuery): Promise<void> {
    const { providerId, startTime, endTime, isConsultation } = query;

    const bookingTimeRange = DateRange.create(startTime, endTime).orThrow();

    const provider = await this.providerQueryRepo.findById(providerId);

    if (!provider) throw new ProviderNotFoundException();

    if (isConsultation) provider.validate.canAcceptConsultation.orThrow();

    const exceptions =
      await this.providerExceptionRepo.findExceptionsByDateRange(
        providerId,
        bookingTimeRange.startDate,
        bookingTimeRange.endDate
      );

    if (provider.validate.operationMode.isShift.value) {
      const providerShifts =
        await this.providerShiftQueryRepo.findShiftsByDateRange(
          providerId,
          bookingTimeRange.startDate,
          bookingTimeRange.endDate
        );

      const dateKey = DateTimeManager.toDateKey(startTime);

      const providerShift = providerShifts.find(
        (providerShift) =>
          DateTimeManager.toDateKey(providerShift.date) === dateKey
      );

      if (!providerShift) throw new ProviderShiftNotFoundException();

      const requestedRange = DayMinuteRange.create(
        DayMinute.fromDate(startTime),
        DayMinute.fromDate(endTime)
      );

      // mola çakışması veya vardiya dışına taşma kontrolü
      providerShift.validate.canBook(requestedRange).orThrow();

      exceptions.forEach((exception) => {
        if (exception.validate.type.isOff.value)
          exception.dateRange.validate
            .overlapping(bookingTimeRange, 'Uzmanın bu saatte izni bulunuyor')
            .orThrow();
      });

      return;
    }

    const availabilities =
      await this.providerAvailabilityQueryRepo.findByProviderId(providerId);

    const providerSchedule = ProviderSchedule.create(
      availabilities,
      exceptions
    );
    providerSchedule.validate.bookingAvailability(bookingTimeRange).orThrow();
  }
}
