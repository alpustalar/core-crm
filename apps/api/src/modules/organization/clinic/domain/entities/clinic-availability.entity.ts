import { randomUUID } from 'crypto';
import { DayMinuteRange } from '@src/domain/value-objects/day-minute-range.vo';
import { DayMinute } from '@src/domain/value-objects/day-minute.vo';
import { ClinicAvailability as IClinicAvailability } from '@shared/generated-zod';
import { DateTimeManager } from '@common/infrastructure/date-time/date-time.manager';
import { TimeZoneType } from '@input-type-schemas/TimeZoneSchema';
import { ClinicAvailabilityCreateProps } from '@modules/organization/clinic/domain/contracts/clinic-availability.contracts';

// TODO: logic hatası olabilir kontrol edilecek

export class ClinicAvailability {
  constructor(data: IClinicAvailability) {
    const timeRangeVo = data.isClosed
      ? null
      : DayMinuteRange.fromNumbers(data.startMinute, data.endMinute);

    this._id = data.id;
    this._clinicId = data.clinicId;
    this._dayOfWeek = data.dayOfWeek;
    this._isClosed = data.isClosed;

    this._timeRange = timeRangeVo;
    this._startMinute = timeRangeVo ? timeRangeVo.start.toNumber() : 0;
    this._endMinute = timeRangeVo ? timeRangeVo.end.toNumber() : 0;
  }

  private _id: string;
  get id(): string {
    return this._id;
  }

  private _clinicId: string;
  get clinicId(): string {
    return this._clinicId;
  }

  private _dayOfWeek: number;
  get dayOfWeek(): number {
    return this._dayOfWeek;
  }

  private _startMinute: number;
  get startMinute(): number {
    return this._startMinute;
  }

  private _endMinute: number;
  get endMinute(): number {
    return this._endMinute;
  }

  private _isClosed: boolean;
  get isClosed(): boolean {
    return this._isClosed;
  }

  private _timeRange: DayMinuteRange | null;
  get timeRange(): DayMinuteRange | null {
    return this._timeRange;
  }

  // ────────────────────────────────────────────────────────────────────────────
  // 🚀 Akıllı Factory Metotları
  // ────────────────────────────────────────────────────────────────────────────

  /**
   * 🎯 Yeni bir çalışma saati kuralı oluşturma kapısı
   */
  public static create(
    props: ClinicAvailabilityCreateProps
  ): ClinicAvailability {
    this.validateDayOfWeek(props.dayOfWeek);

    return new ClinicAvailability({
      id: props.id ?? randomUUID(),
      clinicId: props.clinicId,
      dayOfWeek: props.dayOfWeek,
      startMinute: props.startMinute,
      endMinute: props.endMinute,
      isClosed: props.isClosed ?? false,
    });
  }

  // ────────────────────────────────────────────────────────────────────────────
  // 🎯 İş Kuralları (Business Logic)
  // ────────────────────────────────────────────────────────────────────────────

  private static validateDayOfWeek(day: number): void {
    if (day < 0 || day > 6) {
      throw new Error(
        'Geçersiz gün değeri. Hafta günleri 0 ile 6 arasında olmalıdır.'
      );
    }
  }

  /**
   * Çalışma saatlerini yeni bir DayMinuteRange VO'su ile günceller
   */
  public updateHours(newRange: DayMinuteRange): void {
    if (this._isClosed) {
      throw new Error('Klinik o gün kapalıyken saat güncellemesi yapılamaz.');
    }
    this._timeRange = newRange;
    this._startMinute = newRange.start.toNumber();
    this._endMinute = newRange.end.toNumber();
  }

  /**
   * Kliniğin o günkü kapalılık durumunu değiştirir
   */
  public toggleClosedStatus(
    isClosed: boolean,
    defaultRange?: DayMinuteRange
  ): void {
    this._isClosed = isClosed;
    if (isClosed) {
      this._timeRange = null;
      this._startMinute = 0;
      this._endMinute = 0;
    } else {
      if (!defaultRange) {
        throw new Error(
          'Klinik açılırken varsayılan çalışma saat aralığı (DayMinuteRange) verilmelidir.'
        );
      }
      this._timeRange = defaultRange;
      this._startMinute = defaultRange.start.toNumber();
      this._endMinute = defaultRange.end.toNumber();
    }
  }

  /**
   * 🎯 Verilen bir Date nesnesinin bu çalışma saatlerine uygunluğunu geometric olarak denetler
   */
  public isTimeSlotAvailable(checkTime: Date, tz?: TimeZoneType): boolean {
    if (this._isClosed || !this._timeRange) return false;

    // Gün kontrolü
    const targetDay = DateTimeManager.getDayOfWeek(checkTime, tz);
    if (targetDay !== this._dayOfWeek) return false;

    const currentMinutes = DateTimeManager.getDayMinutes(checkTime, tz);
    const targetDayMinute = DayMinute.fromNumber(currentMinutes);

    return this._timeRange.contains(targetDayMinute);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Serileştirme
  // ────────────────────────────────────────────────────────────────────────────

  /**
   * Başka bir çalışma saati periyoduyla çakışma (overlap) analizi yapar
   */
  public overlapsWith(other: ClinicAvailability): boolean {
    if (this._dayOfWeek !== other.dayOfWeek) return false;
    if (this._isClosed || other.isClosed) return false;
    if (!this._timeRange || !other.timeRange) return false;

    return this._timeRange.overlapsWith(other.timeRange).value;
  }

  toPersistence(): IClinicAvailability {
    return {
      id: this._id,
      clinicId: this._clinicId,
      dayOfWeek: this._dayOfWeek,
      startMinute: this._startMinute,
      endMinute: this._endMinute,
      isClosed: this._isClosed,
    };
  }
}
