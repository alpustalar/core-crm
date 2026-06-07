import { BadRequestException, Inject, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  IProviderAvailabilityRepository,
  PROVIDER_AVAILABILITY_REPOSITORY,
} from '@modules/clinical/provider/domain/repositories/provider-availability.repository.interface';
import {
  IProviderQueryRepository,
  PROVIDER_QUERY_REPOSITORY,
} from '@modules/clinical/provider/domain/repositories/provider.repository.interface';
import { ProviderScheduleEntity } from '@modules/clinical/provider/domain/entities/provider-schedule.entity';
import { ProviderCanBookOrThrowQuery } from './provider-can-book-or-throw.query';
import { OperationMode } from '@prisma/client';
import { DateTimeManager } from '@common/utils';

@QueryHandler(ProviderCanBookOrThrowQuery)
export class ProviderCanBookOrThrowHandler
  implements IQueryHandler<ProviderCanBookOrThrowQuery, void>
{
  constructor(
    @Inject(PROVIDER_AVAILABILITY_REPOSITORY)
    private readonly providerAvailabilityRepo: IProviderAvailabilityRepository,
    @Inject(PROVIDER_QUERY_REPOSITORY)
    private readonly providerQueryRepo: IProviderQueryRepository
  ) {}

  async execute(query: ProviderCanBookOrThrowQuery): Promise<void> {
    const { providerId, startTime, endTime } = query;

    const provider = await this.providerQueryRepo.findById(providerId);
    if (!provider) {
      throw new NotFoundException('Provider bulunamadı.');
    }

    if (!provider.canAcceptExamination) {
      throw new BadRequestException('Uzman muayene randevusu almıyor');
    }

    const exceptions =
      await this.providerAvailabilityRepo.findExceptionsByDateRange(
        providerId,
        startTime,
        endTime
      );

    if (provider.operationMode === OperationMode.SHIFT) {
      const shifts = await this.providerAvailabilityRepo.findShiftsByDateRange(
        providerId,
        startTime,
        endTime
      );

      const dateKey = DateTimeManager.toDateKey(startTime);
      const shift = shifts.find(
        (s) => DateTimeManager.toDateKey(s.date) === dateKey
      );

      if (!shift) {
        throw new BadRequestException(
          'Uzmanın bu tarihe ait vardiyası bulunmuyor.'
        );
      }

      const shiftStartMinute = shift.startMinute;
      const shiftEndMinute = shift.endMinute;
      const appointmentStartMinute = DateTimeManager.getDayMinutes(startTime);
      const appointmentEndMinute = DateTimeManager.getDayMinutes(endTime);

      if (
        appointmentStartMinute < shiftStartMinute ||
        appointmentEndMinute > shiftEndMinute
      ) {
        throw new BadRequestException(
          'Randevu saati uzmanın vardiya saatleri dışında.'
        );
      }

      const hasBlockingException = exceptions.some(
        (e) =>
          e.type === 'OFF' && e.startTime < endTime && e.endTime > startTime
      );

      if (hasBlockingException) {
        throw new BadRequestException('Uzmanın bu saatte izni bulunuyor.');
      }

      return;
    }

    const availabilities =
      await this.providerAvailabilityRepo.findByProviderId(providerId);

    const schedule = new ProviderScheduleEntity(availabilities, exceptions);
    schedule.validateBookingAvailabilityOrThrow(startTime, endTime);
  }
}
