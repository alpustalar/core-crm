import { BadRequestException, Injectable } from '@nestjs/common';
import { addMinutes } from 'date-fns';

@Injectable()
export class AppointmentSlotService {
  assertFiveMinuteBoundaryOrThrow(time: Date): void {
    if (time.getUTCMinutes() % 5 !== 0) {
      throw new BadRequestException(
        'Randevu saati 5 dakikalık slota denk gelmelidir (örn. 09:00, 09:05, 09:10).'
      );
    }
  }

  assertFifteenMinuteBoundaryOrThrow(time: Date): void {
    if (time.getUTCMinutes() % 15 !== 0) {
      throw new BadRequestException(
        'Randevu saati 15 dakikalık slota denk gelmelidir (örn. 09:00, 09:05, 09:10).'
      );
    }
  }

  calculateEndTimeOrThrow(
    start: Date,
    dtoEndTime?: Date,
    duration?: number
  ): Date {
    if (dtoEndTime) return new Date(dtoEndTime);
    if (duration) return addMinutes(start, duration);

    throw new BadRequestException(
      'Randevu süresi veya bitiş zamanı belirlenemedi.'
    );
  }
}
