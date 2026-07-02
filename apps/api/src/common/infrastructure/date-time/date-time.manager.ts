import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import duration from 'dayjs/plugin/duration';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

import {
  TimeZoneSchema,
  TimeZoneType,
} from '@input-type-schemas/TimeZoneSchema';

dayjs.extend(isBetween);
dayjs.extend(duration);
dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

const DEFAULT_TZ: TimeZoneType = TimeZoneSchema.enum.Europe_Istanbul;

type IsTimeWithinRangeInput = {
  checkTime: Date;
  startMinute: number;
  endMinute: number;
  tz?: TimeZoneType;
};

type IsBetweenInput = {
  target: Date | string;
  start: Date | string;
  end: Date | string;
  granularity?: dayjs.OpUnitType;
  inclusivity?: '()' | '[]' | '[)' | '(]';
};

export class DateTimeManager {
  /**
   * Bir tarihin toplam gün dakikasını döner (0 - 1439)
   */
  static getDayMinutes(
    date: Date | string,
    tz: TimeZoneType = DEFAULT_TZ
  ): number {
    const d = this.tz(date, tz);
    return d.hour() * 60 + d.minute();
  }

  static create(
    input?: Date | string | number,
    tz: TimeZoneType = DEFAULT_TZ
  ): Date {
    if (input === undefined) {
      return dayjs().tz(DateTimeManager.toIana(tz)).toDate();
    }

    const parsed = dayjs(input).tz(DateTimeManager.toIana(tz));
    if (!parsed.isValid()) {
      throw new Error(` Geçersiz tarih girdisi sağlandı"`);
    }

    return parsed.toDate();
  }

  /**
   * validasyon
   */
  static isValidTimeZone(value: string): boolean {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: value });
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Belirtilen zaman diliminin şu anki UTC offset'ini döner (Örn: "+03:00")
   */
  static getOffset(tz: TimeZoneType): string {
    return this.tz(undefined, tz).format('Z');
  }

  /**
   * number olan Dakikayı HH:mm formatına çevirir (Örn: 540 -> "09:00")
   */
  static minutesToHHMM(minutes: number): string {
    return dayjs.duration(minutes, 'minutes').format('HH:mm');
  }

  /**
   * Klinik yerel saatindeki bir tarih + saat çiftini (YYYY-MM-DD + HH:mm) doğru
   * UTC anına (Date) çevirir. AI sohbet asistanı "İstanbul 15:00" gibi yerel
   * girdileri buradan UTC'ye dönüştürür — LLM'e zaman dilimi matematiği yaptırılmaz.
   */
  static fromLocalDateTime(
    date: string,
    time: string,
    tz: TimeZoneType = DEFAULT_TZ
  ): Date {
    const parsed = dayjs.tz(
      `${date} ${time}`,
      'YYYY-MM-DD HH:mm',
      DateTimeManager.toIana(tz)
    );
    if (!parsed.isValid()) {
      throw new Error(`Geçersiz tarih/saat: ${date} ${time}`);
    }
    return parsed.toDate();
  }

  /**
   * 🎯 Zaman dilimi (Timezone) sapmalarından etkilenmeden,
   * verilen tarihin haftanın hangi günü olduğunu döner (0: Pazar, 1: Pazartesi, ..., 6: Cumartesi)
   */
  static getDayOfWeek(
    date: Date | string,
    tz: TimeZoneType = DEFAULT_TZ
  ): number {
    return this.tz(date, tz).day();
  }

  /**
   * İki tarih arasındaki saat farkını tam (kesirli) olarak döner (later - earlier)
   */
  static diffInHours(later: Date, earlier: Date): number {
    return dayjs(later).diff(dayjs(earlier), 'hour', true); // true parametresi küsuratı korur (örn: 5.5 saat)
  }

  /**
   * İki tarih arasındaki farkı tam dakika olarak döner (later - earlier)
   */
  static diffInMinutes(later: Date, earlier: Date): number {
    return dayjs(later).diff(dayjs(earlier), 'minute');
  }

  /**
   * Verilen zamanın belirtilen aralıkta olup olmadığını kontrol eder (Sadece saat bazlı)
   */
  static isTimeWithinRange({
    checkTime,
    startMinute,
    endMinute,
    tz = DEFAULT_TZ,
  }: IsTimeWithinRangeInput): boolean {
    const currentMinutes = this.getDayMinutes(checkTime, tz);
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
  static isSameDay(
    date1: Date,
    date2: Date,
    tz: TimeZoneType = DEFAULT_TZ
  ): boolean {
    return this.tz(date1, tz).isSame(this.tz(date2, tz), 'day');
  }

  /**
   * Yeni bir Date oluşturur veya manipüle eder (Immutable)
   */
  static addMinutes(
    date: Date,
    minutes: number,
    tz: TimeZoneType = DEFAULT_TZ
  ): Date {
    return this.tz(date, tz).add(minutes, 'minute').toDate();
  }

  static addDays(
    date: Date,
    days: number,
    tz: TimeZoneType = DEFAULT_TZ
  ): Date {
    return this.tz(date, tz).add(days, 'day').toDate();
  }

  static subtractDays(
    date: Date,
    days: number,
    tz: TimeZoneType = DEFAULT_TZ
  ): Date {
    return this.tz(date, tz).subtract(days, 'day').toDate();
  }

  // YYYY-MM-DD formatında string döner
  static toDateString(date: Date, tz: TimeZoneType = DEFAULT_TZ): string {
    return this.tz(date, tz).format('YYYY-MM-DD');
  }

  static addHours(
    date: Date,
    hours: number,
    tz: TimeZoneType = DEFAULT_TZ
  ): Date {
    return this.tz(date, tz).add(hours, 'hour').toDate();
  }

  static startOfDay(date: Date, tz: TimeZoneType = DEFAULT_TZ): Date {
    return this.tz(date, tz).startOf('day').toDate();
  }

  static endOfDay(date: Date, tz: TimeZoneType = DEFAULT_TZ): Date {
    return this.tz(date, tz).endOf('day').toDate();
  }

  /**
   * Verilen yılın ilk anını döner (1 Ocak 00:00:00)
   */
  static startOfYear(year: number, tz: TimeZoneType = DEFAULT_TZ): Date {
    return dayjs()
      .tz(DateTimeManager.toIana(tz))
      .year(year)
      .startOf('year')
      .toDate();
  }

  /**
   * Verilen yılın son anını döner (31 Aralık 23:59:59.999)
   */
  static endOfYear(year: number, tz: TimeZoneType = DEFAULT_TZ): Date {
    return dayjs()
      .tz(DateTimeManager.toIana(tz))
      .year(year)
      .endOf('year')
      .toDate();
  }

  /**
   * İçinde bulunulan yılı döner (ör. 2026)
   */
  static currentYear(tz: TimeZoneType = DEFAULT_TZ): number {
    return dayjs().tz(DateTimeManager.toIana(tz)).year();
  }

  /**
   * DD.MM.YYYY formatı döner
   */
  static toDateKey(date: Date, tz: TimeZoneType = DEFAULT_TZ): string {
    return this.tz(date, tz).format('YYYY-MM-DD');
  }

  /**
   * YYYY-MM formatında ay anahtarı döner (ör. 2026-06) — aylık grup raporları için.
   */
  static toMonthKey(date: Date, tz: TimeZoneType = DEFAULT_TZ): string {
    return this.tz(date, tz).format('YYYY-MM');
  }

  /**
   * Ayraçsız gün anahtarı döner: DDMMYYYY (ör. 01072026). TCMB günlük kur dosya adı
   * (`/kurlar/YYYYMM/DDMMYYYY.xml`) gibi ayraçsız tarih bekleyen dış servisler için.
   */
  static toCompactDateKey(date: Date, tz: TimeZoneType = DEFAULT_TZ): string {
    return this.tz(date, tz).format('DDMMYYYY');
  }

  /**
   * Ayraçsız ay anahtarı döner: YYYYMM (ör. 202607). TCMB kur klasörü gibi ayraçsız
   * ay segmenti bekleyen dış servisler için.
   */
  static toCompactMonthKey(date: Date, tz: TimeZoneType = DEFAULT_TZ): string {
    return this.tz(date, tz).format('YYYYMM');
  }

  /**
   * İki tarih arasındaki tam gün farkını döner (later - earlier). Vade
   * yaşlandırması (AR aging) gibi gün bazlı hesaplar için.
   */
  static diffInDays(later: Date, earlier: Date): number {
    return dayjs(later).diff(dayjs(earlier), 'day');
  }

  /**
   * Birinci tarihin ikinci tarihten büyük (sonra) olup olmadığını kontrol eder.
   * 'granularity' verilirse kıyaslamayı o hassasiyette yapar (Örn: 'day' verilirse sadece gün bazında bakar, saatleri önemsemez).
   */
  static isAfter(
    date1: Date | string,
    date2: Date | string,
    granularity?: dayjs.OpUnitType
  ): boolean {
    return dayjs(date1).isAfter(dayjs(date2), granularity);
  }

  /**
   * Birinci tarihin ikinci tarihten küçük (önce) olup olmadığını kontrol eder.
   */
  static isBefore(
    date1: Date | string,
    date2: Date | string,
    granularity?: dayjs.OpUnitType
  ): boolean {
    return dayjs(date1).isBefore(dayjs(date2), granularity);
  }

  /**
   * İki tarihin birbirine eşit olup olmadığını kontrol eder.
   * ⚠️ KRİTİK: granularity boş bırakılırsa milisaniyesine kadar eşitliğe bakar.
   * Eğer iki tarihin saatine bakmaksızın "aynı gün" olup olmadığını kontrol etmek istersen 'day' geçmelisin.
   */
  static isSame(
    date1: Date | string,
    date2: Date | string,
    granularity?: dayjs.OpUnitType
  ): boolean {
    return dayjs(date1).isSame(dayjs(date2), granularity);
  }

  /**
   * Prisma enum biçimini (`Europe_Istanbul`) dayjs/Intl'in beklediği IANA biçimine
   * (`Europe/Istanbul`) çevirir. Enum'da bölge ayıracı `_`, IANA'da `/`. Yalnız ilk
   * `_` ayıraca dönüştürülür; şehir içindeki `_` korunur (ör. `America_New_York` →
   * `America/New_York`). Zaten `/` içeren (IANA) değerler olduğu gibi bırakılır.
   */
  static toIana(tz: string): string {
    return tz.includes('/') ? tz : tz.replace('_', '/');
  }

  private static tz(date?: Date | string, tz: TimeZoneType = DEFAULT_TZ) {
    return dayjs(date).tz(DateTimeManager.toIana(tz));
  }
}
