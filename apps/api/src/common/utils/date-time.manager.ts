import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import duration from 'dayjs/plugin/duration';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(isBetween);
dayjs.extend(duration);
dayjs.extend(customParseFormat);

type IsTimeWithinRangeInput = {
  checkTime: Date;
  startMinute: number;
  endMinute: number;
};

type IsBetweenInput = {
  target: Date | string;
  start: Date | string;
  end: Date | string;
  granularity?: dayjs.OpUnitType;
  inclusivity?: '()' | '[]' | '[)' | '(]'; // ( : hariç, [ : dahil
};

export class DateTimeManager {
  /**
   * Bir tarihin toplam gün dakikasını döner (0 - 1439)
   */
  static getDayMinutes(date: Date | string): number {
    const d = dayjs(date);
    return d.hour() * 60 + d.minute();
  }

  /**
   * number olan Dakikayı HH:mm formatına çevirir (Örn: 540 -> "09:00")
   */
  static minutesToHHMM(minutes: number): string {
    return dayjs.duration(minutes, 'minutes').format('HH:mm');
  }

  /**
   * Verilen zamanın belirtilen aralıkta olup olmadığını kontrol eder (Sadece saat bazlı)
   */
  static isTimeWithinRange({
    checkTime,
    startMinute,
    endMinute,
  }: IsTimeWithinRangeInput): boolean {
    const currentMinutes = this.getDayMinutes(checkTime);
    return currentMinutes >= startMinute && currentMinutes <= endMinute;
  }

  static isBetween({
    target,
    start,
    end,
    granularity = 'minute',
    inclusivity = '()',
  }: IsBetweenInput): boolean {
    return dayjs(target).isBetween(start, end, granularity, inclusivity);
  }

  static isOverlapping(
    range1: { start: Date; end: Date },
    range2: { start: Date; end: Date }
  ): boolean {
    return (
      dayjs(range1.start).isBefore(range2.end) &&
      dayjs(range1.end).isAfter(range2.start)
    );
  }

  /**
   * İki Date nesnesinin aynı gün olup olmadığını kontrol eder
   */
  static isSameDay(date1: Date, date2: Date): boolean {
    return dayjs(date1).isSame(date2, 'day');
  }

  /**
   * Yeni bir Date oluşturur veya manipüle eder (Immutable)
   */
  static addMinutes(date: Date, minutes: number): Date {
    return dayjs(date).add(minutes, 'minute').toDate();
  }

  static addDays(date: Date, days: number): Date {
    return dayjs(date).add(days, 'day').toDate();
  }

  static addHours(date: Date, hours: number): Date {
    return dayjs(date).add(hours, 'hour').toDate();
  }

  static startOfDay(date: Date): Date {
    return dayjs(date).startOf('day').toDate();
  }

  static endOfDay(date: Date): Date {
    return dayjs(date).endOf('day').toDate();
  }
  /**
   * DD.MM.YYYY formatı döner
   */
  static toDateKey(date: Date): string {
    return date.toISOString().slice(0, 10);
  }
}
