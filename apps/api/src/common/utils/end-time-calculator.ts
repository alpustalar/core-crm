import { DateTimeManager } from '@common/infrastructure/date-time/date-time.manager';
import { Guard } from '@common/domain/guards';

export function endTimeCalculator(
  start: Date,
  endTime?: Date,
  duration?: number
) {
  let returnTime: Date | undefined;
  if (endTime) {
    returnTime = DateTimeManager.create(endTime);
  }

  if (duration && duration > 0) {
    returnTime = DateTimeManager.addMinutes(start, duration);
  }

  return Guard.monitor(
    returnTime,
    !!returnTime,
    () => new Error('Bitiş zamanı belirlenemedi.')
  );
}
