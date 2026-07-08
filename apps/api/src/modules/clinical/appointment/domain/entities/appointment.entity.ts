import { Appointment as IAppointment } from '@model-schema/AppointmentSchema';
import {
  AppointmentStatusSchema,
  AppointmentStatusType as AppointmentStatus,
} from '@input-type-schemas/AppointmentStatusSchema';
import { ExaminationTypeType as ExaminationType } from '@input-type-schemas/ExaminationTypeSchema';
import { ExternalSystemType as ExternalSystem } from '@input-type-schemas/ExternalSystemSchema';
import { VisitTypeType as VisitType } from '@input-type-schemas/VisitTypeSchema';
import {
  AppointmentSourceSchema,
  AppointmentSourceType as AppointmentSource,
} from '@input-type-schemas/AppointmentSourceSchema';
import {
  AppointmentCreatorTypeSchema,
  AppointmentCreatorTypeType as AppointmentCreatorType,
} from '@input-type-schemas/AppointmentCreatorTypeSchema';
import { AggregateRoot } from '@common/domain/aggregate-root';
import {
  AppointmentCompletedEvent,
  AppointmentCompletedEventPayload,
} from '@modules/clinical/appointment/domain/events/complete-appointment.event';
import { AppointmentScheduledEvent } from '@modules/clinical/appointment/domain/events/schedule-appointment.event';
import { AppointmentBookedEvent } from '@modules/clinical/appointment/domain/events/book-appointment.event';
import { AppointmentCancelledEvent } from '@modules/clinical/appointment/domain/events/cancelled-appointment.event';
import {
  CreateAppointmentProps,
  RescheduleByPatientProps,
} from '@modules/clinical/appointment/domain/contracts/appointment.contracts';
import { TimeZone } from '@src/domain/value-objects/timezone.vo';
import { AppointmentCancellationNotAllowedException } from '@modules/clinical/appointment/domain/exceptions/appointment.exceptions';
import { DateRange } from '@src/domain/value-objects/date-range.vo';
import { UUID } from '@src/domain/value-objects/uuid.vo';
import { DateTimeManager } from '@common/infrastructure/date-time/date-time.manager';
import { Email } from '@src/domain/value-objects/email.vo';
import { Phone } from '@src/domain/value-objects/phone.vo';
import { Guard } from '@common/domain/guards';
import { endTimeCalculator } from '@common/utils';
import { Name } from '@src/domain/value-objects/name.vo';
import { DefaultValidateOptions } from '@common/domain/constants/default-options.constant';
import { shouldValidate } from '@common/domain/utils/should-validate';

export class Appointment extends AggregateRoot {
  constructor(data: IAppointment) {
    super();
    this._id = UUID.fromTrusted(data.id);
    this._patientName = Name.fromTrusted(data.patientName);
    this._patientPhone = Phone.fromTrusted(data.patientPhone);
    this._patientEmail = Email.create(data.patientEmail).instance ?? null;
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
    this._treatmentId = UUID.create(data.treatmentId).instance ?? null;
    this._clinicId = UUID.fromTrusted(data.clinicId);
    this._providerId = UUID.fromTrusted(data.providerId);
    this._patientId = UUID.create(data.patientId).instance ?? null;
    this._examinationType = data.examinationType;
    this._visitType = data.visitType;
    this._resourceId = data.resourceId;
    this._isDeleted = data.isDeleted;
    this._deletedAt = data.deletedAt;
    this._source = data.source;
    this._creatorType = data.creatorType;
    this._approvedAt = data.approvedAt;
    this._approvedBy = data.approvedBy;
    this._createdById = data.createdById;
    this._createdByRealName = data.createdByRealName;
  }

  public static get businessRulesValidator() {
    return {
      create: (start: Date) => {
        const now = DateTimeManager.create();
        const isInvalid = DateTimeManager.isBefore(start, now);

        return {
          isValid: !isInvalid,
          orThrow: () => {
            if (isInvalid)
              throw new Error('Geçmiş bir tarihe randevu oluşturulamaz.');
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

  private _patientName: Name;

  get patientName(): Name {
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

  get startTime(): Date {
    return this._timeRange.startDate;
  }

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

  get deletedAt(): Date | null {
    return this._deletedAt;
  }

  private _source: AppointmentSource;

  get source(): AppointmentSource {
    return this._source;
  }

  private _creatorType: AppointmentCreatorType;

  get creatorType(): AppointmentCreatorType {
    return this._creatorType;
  }

  private _approvedAt: Date | null;

  get approvedAt(): Date | null {
    return this._approvedAt;
  }

  private _approvedBy: string | null;

  get approvedBy(): string | null {
    return this._approvedBy;
  }

  private _createdById: string | null;

  get createdById(): string | null {
    return this._createdById;
  }

  private _createdByRealName: string | null;

  get createdByRealName(): string | null {
    return this._createdByRealName;
  }

  // DOMAIN BUSINESS METHODS

  public get validate() {
    return {
      status: {
        isPending: (error: Error) => this._isPending(error),
        isConfirmed: (error: Error) => this._isConfirmed(error),
        isCancelled: this._isCancelled,
        isCompleted: this._isCompleted,
        isNoShow: this._isNoShow,
      },
      endTime: {
        isInThePast: this._isEndTimeInThePast,
      },
      startTime: {
        isInTheFuture: this._startTimeIsInTheFuture,
      },
    };
  }

  private get businessRulesValidator() {
    return {
      rescheduleByPatient: (
        currentStartTime: Date,
        newStartTime: Date,
        rescheduleLimitHours: number
      ) => {
        const now = DateTimeManager.create();
        const hoursLeft = DateTimeManager.diffInHours(currentStartTime, now);

        // Sınır klinik ayarından (ClinicAppointmentSettings.rescheduleLimitHours)
        // gelir; handler settings'i okuyup domain metoduna geçirir.
        const lastRescheduleTimeForPatient = rescheduleLimitHours;

        const isTooLate = hoursLeft < lastRescheduleTimeForPatient;

        const isNewTimeInPast =
          DateTimeManager.isBefore(newStartTime, now) ||
          DateTimeManager.isSame(newStartTime, now);

        return {
          isValid: !isTooLate && !isNewTimeInPast,
          isNewTimeInPast,

          orThrow: () => {
            if (isTooLate) {
              throw new Error(
                `Randevunuza ${lastRescheduleTimeForPatient} saatten az bir süre kaldığı için sistem üzerinden değişiklik yapamazsınız. Lütfen müşteri hizmetleri ile iletişime geçin.`
              );
            }
            if (isNewTimeInPast) {
              throw new Error(
                'Geçmiş bir tarihe randevu yeniden zamanlanamaz.'
              );
            }
          },
        };
      },
      markAsNoShow: () => {
        const isInvalid =
          !this._isPending().value && !this._isConfirmed().value;
        return {
          isValid: !isInvalid,
          orThrow: () => {
            if (isInvalid)
              throw new Error(
                'Yalnızca onaylanan veya bekleyen randevular gelmeme olarak işaretlenebilir.'
              );
          },
        };
      },
      complete: () => {
        const isInvalid =
          this._isCancelled.value ||
          this._isCompleted.value ||
          this._isNoShow.value;

        return {
          isValid: !isInvalid,
          orThrow: () => {
            if (isInvalid)
              throw new Error(
                `İptal edilmiş, tamamlanmış veya gelmedi durumundaki randevular tamamlanamaz.`
              );
          },
        };
      },
      cancelBooking: this._canBeCancelled,
      cancelSchedule: this._canBeCancelled,
      confirm: () => {
        const isInvalid = !this._isPending().value;
        return {
          isValid: !isInvalid,
          isInvalid,
          orThrow: () => {
            if (isInvalid)
              throw new Error('Yalnızca bekleyen randevular onaylanabilir.');
          },
        };
      },
    };
  }

  private get _isCancelled() {
    const isCancelled = this._status === AppointmentStatusSchema.enum.CANCELLED;
    return Guard.monitor(
      isCancelled,
      isCancelled,
      () => new Error('Randevu durumu "iptal edilmiş" değil')
    );
  }

  private get _isCompleted() {
    const isCompleted = this._status === AppointmentStatusSchema.enum.COMPLETED;

    return Guard.monitor(
      isCompleted,
      isCompleted,
      () => new Error('Randevu durumu "tamamlanmış" değil')
    );
  }

  private get _isNoShow() {
    const is = this._status === AppointmentStatusSchema.enum.NOSHOW;
    return Guard.monitor(
      is,
      is,
      () => new Error('Randevu durumu "gelmedi" değil')
    );
  }

  private get _isEndTimeInThePast() {
    const isInPast = this.endTime < DateTimeManager.create();
    const isInFuture = !isInPast;

    return Guard.monitor(
      isInPast,
      isInFuture,
      () => new Error('Randevu bitiş tarihi eski tarihte')
    );
  }

  private get _startTimeIsInTheFuture() {
    const is = this.startTime > DateTimeManager.create();
    return Guard.monitor(
      is,
      is,
      () => new Error('Başlangıç tarihi ileri bir tarihte değil')
    );
  }

  private get _canBeCancelled() {
    const invalidStatuses: AppointmentStatus[] = [
      AppointmentStatusSchema.enum.CANCELLED,
      AppointmentStatusSchema.enum.COMPLETED,
      AppointmentStatusSchema.enum.NOSHOW,
    ];
    const canBe = !invalidStatuses.includes(this._status);

    return Guard.monitor(
      canBe,
      canBe,
      () => new AppointmentCancellationNotAllowedException()
    );
  }

  private get _canBeRescheduled() {
    const invalidStatuses: AppointmentStatus[] = [
      AppointmentStatusSchema.enum.CANCELLED,
      AppointmentStatusSchema.enum.COMPLETED,
      AppointmentStatusSchema.enum.NOSHOW,
    ];
    const canBe = !invalidStatuses.includes(this._status);
    return Guard.monitor(
      canBe,
      canBe,
      () =>
        new Error(
          `İptal edilmiş, tamamlanmış veya gelmedi durumundaki randevular yeniden zamanlanamaz. Mevcut durum: ${this._status}`
        )
    );
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
  }

  public static calculateEndTime(
    start: Date,
    endTime?: Date,
    duration?: number
  ) {
    return endTimeCalculator(start, endTime, duration);
  }

  private static create(
    props: CreateAppointmentProps,
    validateOptions = DefaultValidateOptions
  ): Appointment {
    if (shouldValidate(validateOptions))
      this.businessRulesValidator.create(props.startTime).orThrow();

    const endTime = this.calculateEndTime(
      props.startTime,
      props.endTime,
      props.duration
    ).orThrow();

    const now = DateTimeManager.create();

    const dateRange = DateRange.create(props.startTime, endTime).orThrow();

    const timezone = TimeZone.create(props.timezone).orThrow().value;

    return new Appointment({
      id: props.id
        ? UUID.create(props.id).orThrow().value
        : UUID.generate().value,

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
      source: props.source ?? AppointmentSourceSchema.enum.CLINIC_INTERNAL,
      creatorType:
        props.creatorType ?? AppointmentCreatorTypeSchema.enum.CLINIC_STAFF,
      approvedAt: null,
      approvedBy: null,
      createdById: props.createdById ?? null,
      createdByRealName: props.createdByRealName ?? null,
    });
  }

  public confirm(options = DefaultValidateOptions): void {
    if (shouldValidate(options))
      this.businessRulesValidator.confirm().orThrow();

    this._status = AppointmentStatusSchema.enum.CONFIRMED;
  }

  public cancelSchedule(
    canceledBy: string,
    reason?: string,
    options = DefaultValidateOptions
  ): void {
    if (shouldValidate(options))
      this.businessRulesValidator.cancelSchedule.orThrow();

    this._applyCancellation(canceledBy, reason);

    // İptal event'i fırlatılır; sağlık turizmi iadesi + hasta bildirimi + audit
    // yan etkileri listener'da (AppointmentCancelledEvent) işlenir.
    this._raiseCancelledEvent(canceledBy, reason);
  }

  /**
   * Hasta (Patient) tarafından yapılan iptal işlemi.
   *
   * NOT: Hastanın kendi iptal edip edemeyeceği (allowPatientCancel) ve iptalin
   * doğrudan mı yoksa "onay bekliyor" olarak mı işleneceği (cancelLimitHours)
   * kararı klinik ayarına bağlıdır ve handler'da verilir (settings okunur).
   * Bu metod çağrıldığında iptal fiilen uygulanır ve event fırlatılır.
   */
  public cancelBooking(patientId?: string, reason?: string): void {
    if (!patientId) {
      throw new Error('Kullanıcı bulunamadı');
    }
    this.businessRulesValidator.cancelBooking.orThrow();
    this._applyCancellation(patientId, reason);

    this._raiseCancelledEvent(patientId, reason);
  }

  public complete(
    eventPayload: Omit<
      AppointmentCompletedEventPayload,
      'appointmentId' | 'clinicId' | 'patientId' | 'providerId'
    >,
    options = DefaultValidateOptions
  ): void {
    if (shouldValidate(options))
      this.businessRulesValidator.complete().orThrow();

    this._status = AppointmentStatusSchema.enum.COMPLETED;
    this._updatedAt = DateTimeManager.create();

    this.addDomainEvent(
      new AppointmentCompletedEvent({
        ...eventPayload,
        appointmentId: this.id.value,
        clinicId: this.clinicId.value,
        patientId: this.patientId?.value ?? null,
        providerId: this.providerId.value,
      })
    );
  }

  public markAsNoShow(options = DefaultValidateOptions): void {
    if (shouldValidate(options))
      this.businessRulesValidator.markAsNoShow().orThrow();

    this._status = AppointmentStatusSchema.enum.NOSHOW;
  }

  public reschedule(
    startTime: Date,
    endTime: Date,
    providerId: string,
    notes?: string,
    treatmentId?: string | null,
    options = DefaultValidateOptions
  ): void {
    this._applyReschedule(
      startTime,
      endTime,
      providerId,
      notes,
      treatmentId,
      options
    );

    // Personel yaptığı için randevu direkt onaylı kalmaya devam edebilir
    this._status = AppointmentStatusSchema.enum.CONFIRMED;
    this._updatedAt = DateTimeManager.create();
  }

  /**
   * Hasta (Patient) tarafından yapılan yeniden zamanlama. Klinik ayarındaki
   * `rescheduleLimitHours` kadar saatten az kaldıysa reddedilir ve işlem onay
   * bekliyor (PENDING) statüsüne düşürülür.
   */
  public rescheduleByPatient(props: RescheduleByPatientProps): void {
    const { startTime, endTime, providerId, notes, treatmentId } = props;

    this.businessRulesValidator
      .rescheduleByPatient(
        this.startTime,
        startTime,
        props.rescheduleLimitHours
      )
      .orThrow();

    this._applyReschedule(startTime, endTime, providerId, notes, treatmentId);
    this._status = AppointmentStatusSchema.enum.PENDING;
    this._updatedAt = DateTimeManager.create();
  }

  public toPersistence(): IAppointment {
    return {
      id: this.id.value,
      patientName: this.patientName.value,
      patientPhone: this.patientPhone.value,
      patientEmail: this.patientEmail?.value ?? null,
      startTime: this.startTime,
      endTime: this.endTime,
      timezone: this.timezone.value,
      treatmentType: this.treatmentType,
      notes: this.notes,
      status: this.status,
      canceledAt: this.canceledAt,
      canceledBy: this.canceledBy,
      cancelReason: this.cancelReason,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      externalSystem: this.externalSystem,
      externalId: this.externalId ?? null,
      treatmentId: this.treatmentId?.value ?? null,
      clinicId: this.clinicId.value,
      providerId: this.providerId.value,
      patientId: this.patientId?.value ?? null,
      examinationType: this.examinationType,
      visitType: this.visitType,
      resourceId: this.resourceId ?? null,
      isDeleted: this.isDeleted,
      deletedAt: this.deletedAt,
      isConsultation: this.isConsultation,
      source: this.source,
      creatorType: this.creatorType,
      approvedAt: this.approvedAt,
      approvedBy: this.approvedBy,
      createdById: this.createdById,
      createdByRealName: this.createdByRealName,
    };
  }

  private _isConfirmed(error?: Error) {
    const isConfirmed = this._status === AppointmentStatusSchema.enum.CONFIRMED;
    return Guard.monitor(
      isConfirmed,
      isConfirmed,
      () => error ?? new Error('Randevu durumu "onaylanmış" değil')
    );
  }

  private _isPending(error?: Error) {
    const isPending = this._status === AppointmentStatusSchema.enum.PENDING;
    return Guard.monitor(
      isPending,
      isPending,
      () => error ?? new Error('Randevu beklemede değil.')
    );
  }

  /**
   * Yeniden zamanlama işlemlerinin ortak validasyon ve atama motoru (Private Helper)
   */
  private _applyReschedule(
    startTime: Date,
    endTime: Date,
    providerId: string,
    notes?: string,
    treatmentId?: string | null,
    options = DefaultValidateOptions
  ): void {
    if (shouldValidate(options)) this._canBeRescheduled.orThrow();

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

  private _raiseCancelledEvent(canceledBy: string, reason?: string): void {
    this.addDomainEvent(
      new AppointmentCancelledEvent({
        appointmentId: this._id.value,
        clinicId: this._clinicId.value,
        providerId: this._providerId.value,
        patientId: this._patientId?.value ?? null,
        patientName: this._patientName.value,
        patientPhone: this._patientPhone.value,
        patientEmail: this._patientEmail?.value ?? null,
        startTime: this.startTime,
        canceledBy,
        cancelReason: reason,
      })
    );
  }
}
