import { randomUUID } from 'crypto';
import { ClinicException as IClinicException } from '@shared';
import { ClinicExceptionCreateProps } from '@modules/organization/clinic/domain/contracts/clinic-exception.contracts';

export class ClinicException {
  // 🎯 Proje standardına uygun olarak PUBLIC constructor kalıyor
  constructor(data: IClinicException) {
    this._id = data.id;
    this._clinicId = data.clinicId;

    // Tarihi saat/dakika karmaşasından kurtarmak için saf güne (00:00:00) eşitliyoruz
    this._date = this.normalizeDate(data.date);

    this._isClosed = data.isClosed;
    this._reason = data.reason ?? null;
  }

  private _id: string;
  get id(): string {
    return this._id;
  }

  private _clinicId: string;
  get clinicId(): string {
    return this._clinicId;
  }

  private _date: Date;
  get date(): Date {
    return this._date;
  }

  private _isClosed: boolean;
  get isClosed(): boolean {
    return this._isClosed;
  }

  private _reason: string | null;
  get reason(): string | null {
    return this._reason;
  }

  // ────────────────────────────────────────────────────────────────────────────
  // 🚀 Akıllı Factory Metotları
  // ────────────────────────────────────────────────────────────────────────────

  /**
   * 🎯 Yeni bir klinik istisnası (Resmi tatil, özel kapatma vs.) oluşturma kapısı
   */
  public static create(props: ClinicExceptionCreateProps): ClinicException {
    return new ClinicException({
      id: props.id ?? randomUUID(),
      clinicId: props.clinicId,
      date: props.date,
      isClosed: props.isClosed ?? true,
      reason: props.reason ?? null,
    });
  }

  // ────────────────────────────────────────────────────────────────────────────
  // 🎯 İş Kuralları (Business Logic)
  // ────────────────────────────────────────────────────────────────────────────

  /**
   * İstisnanın nedenini ve kapatılma durumunu günceller
   */
  public updateReason(reason: string | null, isClosed?: boolean): void {
    this._reason = reason;
    if (isClosed !== undefined) {
      this._isClosed = isClosed;
    }
  }

  /**
   * 🎯 Verilen bir randevu tarihinin bu istisna gününe denk gelip gelmediğini kontrol eder
   */
  public isMatch(checkDate: Date): boolean {
    const target = this.normalizeDate(checkDate);
    return this._date.getTime() === target.getTime();
  }

  /**
   * Bu istisna gününün geçmişte kalıp kalmadığını söyler
   */
  public isPast(): boolean {
    const today = this.normalizeDate(new Date());
    return this._date.getTime() < today.getTime();
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Yardımcı Metotlar & Serileştirme
  // ────────────────────────────────────────────────────────────────────────────

  toPersistence(): IClinicException {
    return {
      id: this._id,
      clinicId: this._clinicId,
      date: this._date,
      isClosed: this._isClosed,
      reason: this._reason,
    };
  }

  /**
   * Tarihin saat, dakika, saniye ve milisaniyesini sıfırlayarak
   * sadece gün bazında (pure date) karşılaştırma yapılabilmesini sağlar.
   */
  private normalizeDate(date: Date): Date {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  }
}
