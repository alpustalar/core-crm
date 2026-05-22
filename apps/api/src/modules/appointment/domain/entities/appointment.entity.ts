import {
  Appointment as IAppointment,
  AppointmentStatus,
  ExaminationType,
  ExternalSystem,
  VisitType,
} from '@prisma/client';
import { DateTimeManager } from '@common/utils';
import { AggregateRoot } from '@common/domain/aggregate-root';

export class Appointment extends AggregateRoot implements IAppointment {
  constructor(data: IAppointment) {
    super();
    this._id = data.id;
    this._patientName = data.patientName;
    this._patientPhone = data.patientPhone;
    this._patientEmail = data.patientEmail;
    this._startTime = data.startTime;
    this._endTime = data.endTime;
    this._timezone = data.timezone;
    this._treatmentType = data.treatmentType;
    this._notes = data.notes;
    this._status = data.status;
    this._canceledAt = data.canceledAt;
    this._canceledBy = data.canceledBy;
    this._cancelReason = data.cancelReason;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
    this._externalSystem = data.externalSystem;
    this._externalId = data.externalId;
    this._treatmentId = data.treatmentId;
    this._clinicId = data.clinicId;
    this._providerId = data.providerId;
    this._patientId = data.patientId;
    this._examinationType = data.examinationType;
    this._visitType = data.visitType;
    this._resourceId = data.resourceId;
    this._isDeleted = data.isDeleted;
    this._deletedAt = data.deletedAt;
  }

  private _id: string;

  // GETTER
  get id(): string {
    return this._id;
  }

  private _patientName: string;

  get patientName(): string {
    return this._patientName;
  }

  private _patientPhone: string;

  get patientPhone(): string {
    return this._patientPhone;
  }

  private _patientEmail: string | null;

  get patientEmail(): string | null {
    return this._patientEmail;
  }

  private _startTime: Date;

  get startTime(): Date {
    return this._startTime;
  }

  private _endTime: Date;

  get endTime(): Date {
    return this._endTime;
  }

  private _timezone: string;

  get timezone(): string {
    return this._timezone;
  }

  private _treatmentType: string | null;

  get treatmentType(): string | null {
    return this._treatmentType;
  }

  private _notes: string | null;

  get notes(): string | null {
    return this._notes;
  }

  private _status: AppointmentStatus;

  get status(): AppointmentStatus {
    return this._status;
  }

  private _canceledAt: Date | null;

  get canceledAt(): Date | null {
    return this._canceledAt;
  }

  private _canceledBy: string | null;

  get canceledBy(): string | null {
    return this._canceledBy;
  }

  private _cancelReason: string | null;

  get cancelReason(): string | null {
    return this._cancelReason;
  }

  private _createdAt: Date;

  get createdAt(): Date {
    return this._createdAt;
  }

  private _updatedAt: Date;

  get updatedAt(): Date {
    return this._updatedAt;
  }

  private _externalSystem: ExternalSystem | null;

  get externalSystem(): ExternalSystem | null {
    return this._externalSystem;
  }

  private _externalId: string | null;

  get externalId(): string | null {
    return this._externalId;
  }

  private _treatmentId: string | null;

  get treatmentId(): string | null {
    return this._treatmentId;
  }

  private _clinicId: string;

  get clinicId(): string {
    return this._clinicId;
  }

  private _providerId: string;

  get providerId(): string {
    return this._providerId;
  }

  private _patientId: string | null;

  get patientId(): string | null {
    return this._patientId;
  }

  private _examinationType: ExaminationType | null;

  get examinationType(): ExaminationType | null {
    return this._examinationType;
  }

  private _visitType: VisitType | null;

  get visitType(): VisitType | null {
    return this._visitType;
  }

  private _resourceId: string | null;

  get resourceId(): string | null {
    return this._resourceId;
  }

  private _isDeleted: boolean;

  get isDeleted(): boolean {
    return this._isDeleted;
  }

  private _deletedAt: Date | null;

  get deletedAt(): Date | null {
    return this._deletedAt;
  }

  // DOMAIN BUSINESS METHODS

  public static calculateEndTime(
    start: Date,
    EndTime?: Date,
    duration?: number
  ): Date {
    if (EndTime) return new Date(EndTime);
    if (duration) return DateTimeManager.addMinutes(start, duration);

    throw new Error('Randevu süresi veya bitiş zamanı belirlenemedi.');
  }

  public confirm(): void {
    if (this._status !== AppointmentStatus.PENDING) {
      throw new Error('Yalnızca bekleyen randevular onaylanabilir.');
    }
    this._status = AppointmentStatus.CONFIRMED;
  }

  public cancel(canceledBy: string, reason?: string): void {
    if (!this.canBeCancelled()) {
      throw new Error(
        'Tamamlanan, iptal edilmiş veya randevuya gelmedi olarak işaretlenmiş randevular iptal edilemez.'
      );
    }

    this._status = AppointmentStatus.CANCELLED;
    this._canceledAt = new Date();
    this._canceledBy = canceledBy;
    if (reason) {
      this._cancelReason = reason;
    }
  }

  public complete(): void {
    if (!this.isPending() && !this.iConfirmed()) {
      throw new Error(
        'Yalnızca onaylanan veya bekleyen randevular tamamlanabilir.'
      );
    }
    this._status = AppointmentStatus.COMPLETED;
  }

  public markAsNoShow(): void {
    if (!this.isPending() && !this.iConfirmed()) {
      throw new Error(
        'Yalnızca onaylanan veya bekleyen randevular gelmeme olarak işaretlenebilir.'
      );
    }
    this._status = AppointmentStatus.NOSHOW;
  }

  // 4. BUSINESS QUERY METHODS (Durum Sorguları)

  public reschedule(
    startTime: Date,
    endTime: Date,
    providerId: string,
    notes?: string,
    treatmentId?: string | null
  ): void {
    if (!this.canBeRescheduled()) {
      throw new Error(
        'İptal edilmiş, tamamlanmış veya gelmedi durumundaki randevular yeniden zamanlanamaz.'
      );
    }

    this._startTime = startTime;
    this._endTime = endTime;
    this._providerId = providerId;
    if (notes !== undefined) this._notes = notes;
    if (treatmentId !== undefined) this._treatmentId = treatmentId;

    // Opsiyonel: Yeniden zamanlandığında statüyü tekrar pending'e veya confirmed'a çekmek istersek:
    // this._status = AppointmentStatus.PENDING;
  }

  public isPending(): boolean {
    return this._status === AppointmentStatus.PENDING;
  }

  public iConfirmed(): boolean {
    // Prisma'daki isConfirmed ile çakışmaması için veya doğrudan getter'dan bağımsız bir check
    return this._status === AppointmentStatus.CONFIRMED;
  }

  public isCancelled(): boolean {
    return this._status === AppointmentStatus.CANCELLED;
  }

  public isCompleted(): boolean {
    return this._status === AppointmentStatus.COMPLETED;
  }

  public isNoShow(): boolean {
    return this._status === AppointmentStatus.NOSHOW;
  }

  public isInThePast(): boolean {
    return this._endTime < new Date();
  }

  public isInTheFuture(): boolean {
    return this._startTime > new Date();
  }

  public canBeRescheduled(): boolean {
    const invalidStatuses: AppointmentStatus[] = [
      AppointmentStatus.CANCELLED,
      AppointmentStatus.COMPLETED,
      AppointmentStatus.NOSHOW,
    ];
    return !invalidStatuses.includes(this._status);
  }

  public toPersistence(): IAppointment {
    return {
      id: this._id,
      patientName: this._patientName,
      patientPhone: this._patientPhone,
      patientEmail: this._patientEmail,
      startTime: this._startTime,
      endTime: this._endTime,
      timezone: this._timezone,
      treatmentType: this._treatmentType,
      notes: this._notes,
      status: this._status,
      canceledAt: this._canceledAt,
      canceledBy: this._canceledBy,
      cancelReason: this._cancelReason,
      createdAt: this._createdAt,
      updatedAt: new Date(),
      externalSystem: this._externalSystem,
      externalId: this._externalId,
      treatmentId: this._treatmentId,
      clinicId: this._clinicId,
      providerId: this._providerId,
      patientId: this._patientId,
      examinationType: this._examinationType,
      visitType: this._visitType,
      resourceId: this._resourceId,
      isDeleted: this._isDeleted,
      deletedAt: this._deletedAt,
    };
  }

  private canBeCancelled(): boolean {
    const invalidStatuses: AppointmentStatus[] = [
      AppointmentStatus.CANCELLED,
      AppointmentStatus.COMPLETED,
      AppointmentStatus.NOSHOW,
    ];
    return !invalidStatuses.includes(this._status);
  }
}
