import { Appointment as IAppointment } from '@model-schema/AppointmentSchema';
import {
  AppointmentStatusSchema,
  AppointmentStatusType as AppointmentStatus,
} from '@input-type-schemas/AppointmentStatusSchema';
import { ExaminationTypeType as ExaminationType } from '@input-type-schemas/ExaminationTypeSchema';
import { ExternalSystemType as ExternalSystem } from '@input-type-schemas/ExternalSystemSchema';
import { VisitTypeType as VisitType } from '@input-type-schemas/VisitTypeSchema';
import { AggregateRoot } from '@common/domain/aggregate-root';
import {
  AppointmentCompletedEvent,
  AppointmentCompletedEventPayload,
} from '@modules/clinical/appointment/domain/events/complete-appointment.event';
import { AppointmentScheduledEvent } from '@modules/clinical/appointment/domain/events/schedule-appointment.event';
import { AppointmentBookedEvent } from '@modules/clinical/appointment/domain/events/book-appointment.event';
import { CreateAppointmentProps } from '@modules/clinical/appointment/domain/contracts/appointment.contracts';
import { TimeZone } from '@src/domain/value-objects/timezone.vo';
import { AppointmentCancellationNotAllowedException } from '@modules/clinical/appointment/domain/exceptions/appointment.exceptions';
import { DateRange } from '@src/domain/value-objects/date-range.vo';
import { UUID } from '@src/domain/value-objects/uuid.vo';
import { DateTimeManager } from '@common/infrastructure/date-time/date-time.manager';
import { Email } from '@src/domain/value-objects/email.vo';
import { Phone } from '@src/domain/value-objects/phone.vo';
import { Guard } from '@common/domain/guards';

export class Appointment extends AggregateRoot {
  constructor(data: IAppointment) {
    super();
    this._id = UUID.fromTrusted(data.id);
    this._patientName = data.patientName;
    this._patientPhone = Phone.fromTrusted(data.patientPhone);
    this._patientEmail = data.patientEmail
      ? Email.fromTrusted(data.patientEmail)
      : null;
    this._timeRange = DateRange.fromTrusted(data.startTime, data.endTime);
    this._timezone = TimeZone.fromTrusted(data.timezone);
    this._treatmentType = data.treatmentType;
    this._notes = data.notes;
    this._status = data.status;
    this._canceledAt = data.canceledAt;
    this._canceledBy = data.canceledBy;
    this._cancelReason = data.cancelReason;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
    this._externalSystem = data.externalSystem;
    this._externalId = data.externalId ?? null;
    this._treatmentId = data.treatmentId
      ? UUID.fromTrusted(data.treatmentId)
      : null;
    this._clinicId = UUID.fromTrusted(data.clinicId);
    this._providerId = UUID.fromTrusted(data.providerId);
    this._patientId = data.patientId ? UUID.fromTrusted(data.patientId) : null;
    this._examinationType = data.examinationType;
    this._visitType = data.visitType;
    this._resourceId = data.resourceId ? data.resourceId : null;
    this._isDeleted = data.isDeleted;
    this._deletedAt = data.deletedAt;
  }

  /**
   * Randevu süreçlerine ait tüm iş kurallarını (Business Invariants) denetleyen merkezi motor.
   */
  public static get validate() {
    return {
      creation: (start: Date) => {
        const now = DateTimeManager.create();
        const isInvalid = DateTimeManager.isBefore(start, now);

        return {
          isValid: !isInvalid,
          isInvalid,
          orThrow: () => {
            if (isInvalid)
              throw new Error('Geçmiş bir tarihe randevu oluşturulamaz.');
          },
        };
      },

      patientReschedule: (currentStartTime: Date, newStartTime: Date) => {
        const now = DateTimeManager.create();
        const hoursLeft = DateTimeManager.diffInHours(currentStartTime, now);

        const isTooLate = hoursLeft < 6;
        const isNewTimeInPast =
          DateTimeManager.isBefore(newStartTime, now) ||
          DateTimeManager.isSame(newStartTime, now);

        return {
          isValid: !isTooLate && !isNewTimeInPast,
          isTooLate,
          isNewTimeInPast,
          orThrow: () => {
            if (isTooLate) {
              throw new Error(
                'Randevunuza 6 saatten az bir süre kaldığı için sistem üzerinden değişiklik yapamazsınız. Lütfen müşteri hizmetleri ile iletişime geçin.'
              );
            }
            if (isNewTimeInPast) {
              throw new Error(
                '[Appointment] Geçmiş bir tarihe randevu yeniden zamanlanamaz.'
              );
            }
          },
        };
      },
    };
  }

  private _id: UUID;

  get id(): UUID {
    return this._id;
  }

  private _isConsultation: boolean;
  get isConsultation(): boolean {
    return this._isConsultation;
  }

  private _patientName: string;

  get patientName(): string {
    return this._patientName;
  }

  private _patientPhone: Phone;

  get patientPhone(): Phone {
    return this._patientPhone;
  }

  private _patientEmail: Email | null;

  get patientEmail(): Email | null {
    return this._patientEmail;
  }

  private _startTime: Date;

  get startTime(): Date {
    return this._timeRange.startDate;
  }

  private _endTime: Date;

  get endTime(): Date {
    return this._timeRange.endDate;
  }

  private _timeRange: DateRange;

  get timeRange(): DateRange {
    return this._timeRange;
  }

  private _timezone: TimeZone;

  get timezone(): TimeZone {
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

  private _treatmentId: UUID | null;

  get treatmentId(): UUID | null {
    return this._treatmentId;
  }

  private _clinicId: UUID;

  get clinicId(): UUID {
    return this._clinicId;
  }

  private _providerId: UUID;

  get providerId(): UUID {
    return this._providerId;
  }

  private _patientId: UUID | null;

  get patientId(): UUID | null {
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

  // DOMAIN BUSINESS METHODS

  get deletedAt(): Date | null {
    return this._deletedAt;
  }

  public static schedule(props: CreateAppointmentProps): Appointment {
    const appointment = Appointment.create(props);
    appointment.addDomainEvent(
      new AppointmentScheduledEvent({
        appointmentId: appointment.id.value,
        clinicId: appointment.clinicId.value,
        providerId: appointment.providerId.value,
        patientId: appointment.patientId?.value ?? null,
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
        appointmentId: appointment.id.value,
        clinicId: appointment.clinicId.value,
        providerId: appointment.providerId.value,
        patientId: appointment.patientId?.value ?? null,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
      })
    );
    return appointment;

    // TODO: domain event eklenecek.
  }

  public static calculateEndTime(
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
      new Error('Randevu süresi veya bitiş zamanı belirlenemedi.')
    );
  }

  private static create(props: CreateAppointmentProps): Appointment {
    this.validate.creation(props.startTime).orThrow();

    const endTime = this.calculateEndTime(
      props.startTime,
      props.endTime,
      props.duration
    ).orThrow();

    const now = DateTimeManager.create();

    const dateRange = DateRange.create(props.startTime, endTime).orThrow();

    const timezone = TimeZone.create(props.timezone).orThrow().value;

    return new Appointment({
      id: UUID.create(props.id).instance?.value ?? UUID.generate().value,
      patientName: props.patientName,
      patientPhone: Phone.create(props.patientPhone).orThrow().value,
      patientEmail: props.patientEmail
        ? Email.create(props.patientEmail).orThrow().value
        : null,
      patientId: props.patientId ?? null,
      providerId: UUID.create(props.providerId).orThrow().value,
      clinicId: UUID.create(props.clinicId).orThrow().value,
      treatmentId: props.treatmentId
        ? UUID.create(props.clinicId).orThrow().value
        : null,
      startTime: dateRange.startDate,
      endTime: dateRange.endDate,
      timezone,
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
      isConsultation: props.isConsultation,
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

    // TODO: domain event pushlanılacak. sağlık turizmi içinde ise payment işlemleri yapılacak
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
      throw new AppointmentCancellationNotAllowedException();
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
    this._updatedAt = DateTimeManager.create();

    this.addDomainEvent(
      new AppointmentCompletedEvent({
        ...eventPayload,
        appointmentId: this._id.value,
        clinicId: this._clinicId.value,
        patientId: this._patientId?.value ?? null,
        providerId: this._providerId.value,
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
    this._updatedAt = DateTimeManager.create();
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
    Appointment.validate.patientReschedule(this.startTime, startTime).orThrow();

    this._applyReschedule(startTime, endTime, providerId, notes, treatmentId);
    this._status = AppointmentStatusSchema.enum.PENDING;
    this._updatedAt = DateTimeManager.create();
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

    // TODO: event fırlatılacak. complete olduktan sonra ödeme geri alınamaz olarak işaretlenecek. payment işlemler hep queue ile kullanılacak
  }

  public isNoShow(): boolean {
    return this._status === AppointmentStatusSchema.enum.NOSHOW;
  }

  public isInThePast(): boolean {
    return this._endTime < DateTimeManager.create();
  }

  public isInTheFuture(): boolean {
    return this._startTime > DateTimeManager.create();
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
      id: this._id.value,
      patientName: this._patientName,
      patientPhone: this._patientPhone.value,
      patientEmail: this._patientEmail?.value ?? null,
      startTime: this._startTime,
      endTime: this._endTime,
      timezone: this._timezone.value,
      treatmentType: this._treatmentType,
      notes: this._notes,
      status: this._status,
      canceledAt: this._canceledAt,
      canceledBy: this._canceledBy,
      cancelReason: this._cancelReason,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      externalSystem: this._externalSystem,
      externalId: this._externalId ?? null,
      treatmentId: this._treatmentId?.value ?? null,
      clinicId: this._clinicId.value,
      providerId: this._providerId.value,
      patientId: this._patientId?.value ?? null,
      examinationType: this._examinationType,
      visitType: this._visitType,
      resourceId: this._resourceId ?? null,
      isDeleted: this._isDeleted,
      deletedAt: this._deletedAt,
      isConsultation: this._isConsultation,
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

    this._timeRange = DateRange.create(startTime, endTime).orThrow();
    this._providerId = UUID.create(providerId).orThrow();

    if (notes !== undefined) this._notes = notes;
    if (treatmentId)
      this._treatmentId = UUID.create(treatmentId).instance ?? null;
  }

  private _applyCancellation(canceledBy: string, reason?: string): void {
    this._status = AppointmentStatusSchema.enum.CANCELLED;
    this._canceledAt = DateTimeManager.create();
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
