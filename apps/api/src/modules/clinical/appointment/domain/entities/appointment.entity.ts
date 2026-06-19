import { Appointment as IAppointment } from '@model-schema/AppointmentSchema';
import {
  AppointmentStatusSchema,
  AppointmentStatusType as AppointmentStatus,
} from '@input-type-schemas/AppointmentStatusSchema';
import { ExaminationTypeType as ExaminationType } from '@input-type-schemas/ExaminationTypeSchema';
import { ExternalSystemType as ExternalSystem } from '@input-type-schemas/ExternalSystemSchema';
import { VisitTypeType as VisitType } from '@input-type-schemas/VisitTypeSchema';
import { randomUUID } from 'crypto';
import { DateTimeManager } from '@common/utils';
import { AggregateRoot } from '@common/domain/aggregate-root';
import {
  AppointmentCompletedEvent,
  AppointmentCompletedEventPayload,
} from '@modules/clinical/appointment/domain/events/complete-appointment.event';
import { AppointmentScheduledEvent } from '@modules/clinical/appointment/domain/events/schedule-appointment.event';
import { AppointmentBookedEvent } from '@modules/clinical/appointment/domain/events/book-appointment.event';
import { CreateAppointmentProps } from '@modules/clinical/appointment/domain/appointment.contracts';

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

  public static schedule(props: CreateAppointmentProps): Appointment {
    const appointment = Appointment.create(props);
    appointment.addDomainEvent(
      new AppointmentScheduledEvent({
        appointmentId: appointment.id,
        clinicId: appointment.clinicId,
        providerId: appointment.providerId,
        patientId: appointment.patientId,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
      })
    );
    return appointment;
  }

  public static book(props: CreateAppointmentProps): Appointment {
    const appointment = Appointment.create(props);
    appointment.addDomainEvent(
      new AppointmentBookedEvent({
        appointmentId: appointment.id,
        clinicId: appointment.clinicId,
        providerId: appointment.providerId,
        patientId: appointment.patientId,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
      })
    );
    return appointment;
  }

  public static calculateEndTimeOrThrow(
    start: Date,
    endTime?: Date,
    duration?: number
  ): Date {
    if (endTime) {
      const parsedEndTime = new Date(endTime);
      if (parsedEndTime <= new Date(start)) {
        throw new Error(
          'Bitiş zamanı başlangıç zamanından önce veya eşit olamaz.'
        );
      }
      return parsedEndTime;
    }

    if (duration && duration > 0) {
      return DateTimeManager.addMinutes(start, duration);
    }

    throw new Error(
      'Randevu süresi (duration) veya bitiş zamanı (endTime) belirlenemedi.'
    );
  }

  private static create(props: CreateAppointmentProps): Appointment {
    const now = new Date();
    const endTime = Appointment.calculateEndTimeOrThrow(
      props.startTime,
      props.endTime,
      props.duration
    );

    if (props.startTime < now) {
      throw new Error('Geçmiş bir tarihe randevu oluşturulamaz.');
    }

    return new Appointment({
      id: props.id ?? randomUUID(),
      patientName: props.patientName,
      patientPhone: props.patientPhone,
      patientEmail: props.patientEmail ?? null,
      patientId: props.patientId ?? null,
      providerId: props.providerId,
      clinicId: props.clinicId,
      treatmentId: props.treatmentId ?? null,
      startTime: props.startTime,
      endTime,
      timezone: props.timezone ?? 'Europe/Istanbul',
      notes: props.notes ?? null,
      treatmentType: props.treatmentType ?? null,
      externalSystem: props.externalSystem ?? null,
      externalId: props.externalId ?? null,
      examinationType: props.examinationType ?? null,
      visitType: props.visitType ?? null,
      resourceId: props.resourceId ?? null,
      status: props.status ?? AppointmentStatusSchema.enum.PENDING,
      canceledAt: null,
      canceledBy: null,
      cancelReason: null,
      createdAt: now,
      updatedAt: now,
      isDeleted: false,
      deletedAt: null,
    });
  }

  public confirm(): void {
    if (this._status !== AppointmentStatusSchema.enum.PENDING) {
      throw new Error('Yalnızca bekleyen randevular onaylanabilir.');
    }
    this._status = AppointmentStatusSchema.enum.CONFIRMED;
  }

  public cancelSchedule(canceledBy: string, reason?: string): void {
    if (!this._canBeCancelled()) {
      throw new Error(
        'Tamamlanan, iptal edilmiş veya randevuya gelmedi olarak işaretlenmiş randevular iptal edilemez.'
      );
    }
    this._applyCancellation(canceledBy, reason);
  }

  /**
   * Hasta (Patient) tarafından yapılan iptal işlemi.
   *
   */

  // TODO: Klinikten gelen dinamik saat kuralına (`minCancelHoursBefore`) göre denetlensin. DB'de ayar olarak tutulsun. şu an için bir kontrol yok. kaç saat öncesine kadar iptal sağlanabileceği kliniğe göre ayarlanacak.
  public cancelBooking(patientId?: string, reason?: string): void {
    if (!patientId) {
      throw new Error('Kullanıcı bulunamadı');
    }

    if (!this._canBeCancelled()) {
      throw new Error(
        'Tamamlanan, iptal edilmiş veya randevuya gelmedi olarak işaretlenmiş randevular iptal edilemez.'
      );
    }
    this._applyCancellation(patientId, reason);
  }

  public complete(
    eventPayload: Omit<
      AppointmentCompletedEventPayload,
      'appointmentId' | 'clinicId' | 'patientId' | 'providerId'
    >
  ): void {
    if (this.isCancelled() || this.isCompleted() || this.isNoShow()) {
      throw new Error(
        `İptal edilmiş, tamamlanmış veya gelmedi durumundaki randevular tamamlanamaz.`
      );
    }
    this._status = AppointmentStatusSchema.enum.COMPLETED;
    this._updatedAt = new Date();

    this.addDomainEvent(
      new AppointmentCompletedEvent({
        ...eventPayload,
        appointmentId: this._id,
        clinicId: this._clinicId,
        patientId: this._patientId,
        providerId: this._providerId,
      })
    );
  }

  public markAsNoShow(): void {
    if (!this.isPending() && !this.isConfirmed()) {
      throw new Error(
        'Yalnızca onaylanan veya bekleyen randevular gelmeme olarak işaretlenebilir.'
      );
    }
    this._status = AppointmentStatusSchema.enum.NOSHOW;
  }

  public reschedule(
    startTime: Date,
    endTime: Date,
    providerId: string,
    notes?: string,
    treatmentId?: string | null
  ): void {
    // Ortak zamanlama mantığını çalıştır
    this._applyReschedule(startTime, endTime, providerId, notes, treatmentId);

    // Personel yaptığı için randevu direkt onaylı kalmaya devam edebilir
    this._status = AppointmentStatusSchema.enum.CONFIRMED;
    this._updatedAt = new Date();
  }

  /**
   * Hasta (Patient) tarafından yapılan yeniden zamanlama.
   * 6 saat kısıtlaması doğrulanır ve onay bekliyor (PENDING) statüsüne düşürülür.
   */

  // TODO: kaç saat öncesine kadar değişiklik yapabilir klinik ayarlarında DB'de tutulsun
  public rescheduleByPatient(
    startTime: Date,
    endTime: Date,
    providerId: string,
    notes?: string,
    treatmentId?: string | null
  ): void {
    const now = new Date();

    const hoursLeft = DateTimeManager.diffInHours(this._startTime, now);

    if (hoursLeft < 6) {
      throw new Error(
        'Randevunuza 6 saatten az bir süre kaldığı için sistem üzerinden değişiklik yapamazsınız. Lütfen müşteri hizmetleri ile iletişime geçin.'
      );
    }

    if (startTime <= now) {
      throw new Error('Geçmiş bir tarihe randevu yeniden zamanlanamaz.');
    }

    this._applyReschedule(startTime, endTime, providerId, notes, treatmentId);
    this._status = AppointmentStatusSchema.enum.PENDING;
    this._updatedAt = now;
  }

  public isPending(): boolean {
    return this._status === AppointmentStatusSchema.enum.PENDING;
  }

  // 4. BUSINESS QUERY METHODS (Durum Sorguları)

  public isConfirmed(): boolean {
    return this._status === AppointmentStatusSchema.enum.CONFIRMED;
  }

  public isCancelled(): boolean {
    return this._status === AppointmentStatusSchema.enum.CANCELLED;
  }

  public isCompleted(): boolean {
    return this._status === AppointmentStatusSchema.enum.COMPLETED;
  }

  public isNoShow(): boolean {
    return this._status === AppointmentStatusSchema.enum.NOSHOW;
  }

  public isInThePast(): boolean {
    return this._endTime < new Date();
  }

  public isInTheFuture(): boolean {
    return this._startTime > new Date();
  }

  public canBeRescheduled(): boolean {
    const invalidStatuses: AppointmentStatus[] = [
      AppointmentStatusSchema.enum.CANCELLED,
      AppointmentStatusSchema.enum.COMPLETED,
      AppointmentStatusSchema.enum.NOSHOW,
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
      updatedAt: this._updatedAt,
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

  /**
   * Yeniden zamanlama işlemlerinin ortak validasyon ve atama motoru (Private Helper)
   */
  private _applyReschedule(
    startTime: Date,
    endTime: Date,
    providerId: string,
    notes?: string,
    treatmentId?: string | null
  ): void {
    if (!this.canBeRescheduled()) {
      throw new Error(
        `İptal edilmiş, tamamlanmış veya gelmedi durumundaki randevular yeniden zamanlanamaz. Mevcut durum: ${this._status}`
      );
    }

    if (new Date(endTime) <= new Date(startTime)) {
      throw new Error(
        'Bitiş zamanı başlangıç zamanından önce veya eşit olamaz.'
      );
    }

    this._startTime = startTime;
    this._endTime = endTime;
    this._providerId = providerId;

    if (notes !== undefined) this._notes = notes;
    if (treatmentId !== undefined) this._treatmentId = treatmentId;
  }

  private _applyCancellation(canceledBy: string, reason?: string): void {
    this._status = AppointmentStatusSchema.enum.CANCELLED;
    this._canceledAt = new Date();
    this._canceledBy = canceledBy;
    if (reason) {
      this._cancelReason = reason;
    }
  }

  private _canBeCancelled(): boolean {
    const invalidStatuses: AppointmentStatus[] = [
      AppointmentStatusSchema.enum.CANCELLED,
      AppointmentStatusSchema.enum.COMPLETED,
      AppointmentStatusSchema.enum.NOSHOW,
    ];
    return !invalidStatuses.includes(this._status);
  }
}
