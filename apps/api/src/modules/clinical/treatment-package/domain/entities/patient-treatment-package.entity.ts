import {
  Patient,
  PatientPackageStatus,
  PatientPackageStatusSchema,
  PatientTreatmentPackage as IPatientTreatmentPackage,
  Payment,
  Provider,
  TreatmentPackage,
} from '@shared';
import { AggregateRoot } from '@common/domain/aggregate-root';
import {
  CreatePatientTreatmentPackageProps,
  UpdatePatientTreatmentPackageProps,
} from '@modules/clinical/treatment-package/domain/contracts/patient-treatment-package.contracts';
import { DateRange } from '@src/domain/value-objects/date-range.vo';
import {
  InvalidTreatmentPackageResumeException,
  InvalidTreatmentPackageStatusException,
} from '@modules/clinical/treatment-package/domain/exceptions/patient-treatment-package.exceptions';
import { DateTimeManager } from '@common/infrastructure/date-time/date-time.manager';
import { UUID } from '@src/domain/value-objects/uuid.vo';
import { isNotUndefined } from '@common/utils/is-not-undefined';
import { Guard } from '@common/domain/guards';
import { DefaultValidateOptions } from '@common/domain/constants/default-options.constant';
import { shouldValidate } from '@common/domain/utils/should-validate';

interface IPatientPackageValidator {
  status: {
    isActive: Guard<boolean>;
    isCompleted: Guard<boolean>;
    isCancelled: Guard<boolean>;
    isSuspended: Guard<boolean>;
    isExpired: Guard<boolean>;
  };
  lifecycle: {
    canComplete: Guard<boolean>;
    canCancel: Guard<boolean>;
    canSuspend: Guard<boolean>;
    canResume: Guard<boolean>;
    canUncancel: Guard<boolean>;
  };
}
export class PatientTreatmentPackage extends AggregateRoot {
  constructor(data: IPatientTreatmentPackage) {
    super();

    this._id = UUID.fromTrusted(data.id);
    this._patientId = UUID.fromTrusted(data.patientId);
    this._packageId = UUID.fromTrusted(data.packageId);
    this._providerId = UUID.fromTrusted(data.providerId);
    this._paymentId = data.paymentId ?? null;

    this._dateRange = DateRange.fromTrusted(data.startDate, data.endDate);

    this._notes = data.notes ?? null;
    this._status = data.status;
    this._usedExaminationCount = data.usedExaminationCount;
    this._usedControlCount = data.usedControlCount;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
  }

  private _id: UUID;
  get id(): UUID {
    return this._id;
  }

  private _patientId: UUID;
  get patientId(): UUID {
    return this._patientId;
  }

  private _packageId: UUID;
  get packageId(): UUID {
    return this._packageId;
  }

  private _providerId: UUID;
  get providerId(): UUID {
    return this._providerId;
  }

  private _paymentId: string | null;
  get paymentId(): string | null {
    return this._paymentId;
  }

  private _notes: string | null;
  get notes(): string | null {
    return this._notes;
  }

  private _status: PatientPackageStatus;
  get status(): PatientPackageStatus {
    return this._status;
  }

  private _usedExaminationCount: number;
  get usedExaminationCount(): number {
    return this._usedExaminationCount;
  }

  private _usedControlCount: number;
  get usedControlCount(): number {
    return this._usedControlCount;
  }

  private _createdAt: Date;
  get createdAt(): Date {
    return this._createdAt;
  }

  private _updatedAt: Date;
  get updatedAt(): Date {
    return this._updatedAt;
  }

  private _patient: Patient | null;
  get patient(): Patient | null {
    return this._patient;
  }

  private _dateRange: DateRange;
  get dateRange(): DateRange {
    return this._dateRange;
  }

  private _package: TreatmentPackage | null;
  get package(): TreatmentPackage | null {
    return this._package;
  }

  private _provider: Provider | null;
  get provider(): Provider | null {
    return this._provider;
  }

  private _payment: Payment | null;
  get payment(): Payment | null {
    return this._payment;
  }

  public get validate(): IPatientPackageValidator {
    const self = this;

    const isActive = this._isActive;
    const isCompleted = this._isCompleted;
    const isCancelled = this._isCancelled;
    const isSuspended = this._isSuspended;
    const isExpired = self._isExpired;

    const canComplete = this._canComplete;
    const canCancel = this._canCancel;
    const canSuspend = this._canSuspend;
    const canResume = this._canResume;
    const canUncancel = this._canUncancel;
    return {
      status: {
        get isActive() {
          return isActive;
        },
        get isCompleted() {
          return isCompleted;
        },
        get isCancelled() {
          return isCancelled;
        },
        get isSuspended() {
          return isSuspended;
        },
        get isExpired() {
          return isExpired;
        },
      },
      lifecycle: {
        get canComplete() {
          return canComplete;
        },
        get canCancel() {
          return canCancel;
        },
        get canSuspend() {
          return canSuspend;
        },
        get canResume() {
          return canResume;
        },
        // 🎯 İptal geri alınabilir mi? Sadece iptal edilmişse ve paketin süresi hala dolmadıysa
        get canUncancel() {
          return canUncancel;
        },
      },
    };
  }

  private get _isExpired() {
    const { isExpired, isValid } = this._dateRange.validate.expiration;
    return Guard.monitor(
      isExpired,
      isValid,
      () => new Error('Paketin süresi dolmuş.')
    );
  }

  private get _canSuspend() {
    const can = this._isActive.value && !this._isExpired.value;
    return Guard.monitor(
      can,
      can,
      () =>
        new InvalidTreatmentPackageStatusException(this.status, this.id.value)
    );
  }

  private get _canResume() {
    const can = this._isSuspended.value && !this._isExpired.value;
    return Guard.monitor(
      can,
      can,
      () => new Error('Bu paket devam ettirilemez')
    );
  }

  private get _canUncancel() {
    const can = this._isCancelled.value && !this._isExpired.value;
    return Guard.monitor(
      can,
      can,
      () => new Error('Bu paket tekrar aktif hale getirilemez')
    );
  }

  private get _canComplete() {
    const can = this._isActive.value && !this._isExpired.value;
    return Guard.monitor(
      can,
      can,
      () => new Error('Bu paket tamamlanabilir değil')
    );
  }

  private get _canCancel() {
    const can = !this._isCompleted.value && !this._isCancelled.value;
    return Guard.monitor(can, can, () => new Error('Bu paket iptal edilemez.'));
  }

  private get _isCompleted() {
    const isComplete =
      this._status === PatientPackageStatusSchema.enum.COMPLETED;
    return Guard.monitor(
      isComplete,
      isComplete,
      () => new Error('Paket kapalı değil')
    );
  }

  private get _isCancelled() {
    const isCancel = this._status === PatientPackageStatusSchema.enum.CANCELLED;
    return Guard.monitor(
      isCancel,
      isCancel,
      () => new Error('Paket iptal edilmemiş')
    );
  }

  private get _isActive() {
    const isActive = this._status === PatientPackageStatusSchema.enum.ACTIVE;
    return Guard.monitor(
      isActive,
      isActive,
      () => new Error('Paket aktif değil')
    );
  }

  private get _isSuspended() {
    const isSuspend =
      this._status === PatientPackageStatusSchema.enum.SUSPENDED;
    return Guard.monitor(
      isSuspend,
      isSuspend,
      () => new Error('Paket askıya alınmamış')
    );
  }

  private get _businessRulesValidator() {
    return {
      reactivate: () => {
        const valid = this._isCancelled.value;
        return {
          valid,
          isInvalid: !valid,
          orThrow: () => {
            if (!valid)
              throw new Error(
                'Sadece iptal edilmiş paketler yeniden etkinleştirilebilir.'
              );
          },
        };
      },
    };
  }

  static create(
    props: CreatePatientTreatmentPackageProps
  ): PatientTreatmentPackage {
    const now = DateTimeManager.create();

    const dateRange = DateRange.create(
      props.startDate,
      props.endDate
    ).orThrow();

    const id = props.id ? UUID.create(props.id).orThrow() : UUID.generate();

    return new PatientTreatmentPackage({
      id: id.value,
      patientId: UUID.create(props.patientId).orThrow().value,
      packageId: UUID.create(props.packageId).orThrow().value,
      providerId: UUID.create(props.providerId).orThrow().value,
      paymentId: props.paymentId ?? null,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      notes: props.notes ?? null,
      status: PatientPackageStatusSchema.enum.ACTIVE,
      usedExaminationCount: 0,
      usedControlCount: 0,
      createdAt: now,
      updatedAt: now,
    });
  }

  update(props: UpdatePatientTreatmentPackageProps): void {
    if (isNotUndefined(props.providerId)) {
      this._providerId = UUID.create(props.providerId).orThrow();
    }

    if (isNotUndefined(props.notes)) {
      this._notes = props.notes;
    }

    if (isNotUndefined(props.startDate) || isNotUndefined(props.endDate)) {
      const finalStartDate = props.startDate ?? this._dateRange.startDate;
      const finalEndDate = props.endDate ?? this._dateRange.endDate;

      this._dateRange = DateRange.create(
        finalStartDate,
        finalEndDate
      ).orThrow();
    }

    this._updatedAt = DateTimeManager.create();
  }

  complete(options = DefaultValidateOptions): void {
    if (shouldValidate(options)) this._canComplete.orThrow();
    this._status = PatientPackageStatusSchema.enum.COMPLETED;
  }

  cancel(options = DefaultValidateOptions): void {
    if (shouldValidate(options)) this._isCancelled.orThrow();
    this._status = PatientPackageStatusSchema.enum.CANCELLED;
  }

  reactivate(options = DefaultValidateOptions): void {
    if (shouldValidate(options))
      this._businessRulesValidator.reactivate().orThrow();

    this._status = PatientPackageStatusSchema.enum.ACTIVE;
    this._updatedAt = DateTimeManager.create();
  }

  suspend(options = DefaultValidateOptions): void {
    if (shouldValidate(options)) this._canSuspend.orThrow();
    this._status = PatientPackageStatusSchema.enum.SUSPENDED;
  }

  resume(): void {
    if (!this._isSuspended.value) {
      throw new InvalidTreatmentPackageResumeException(
        this.status,
        this.id.value
      );
    }
    this._status = PatientPackageStatusSchema.enum.ACTIVE;
  }

  incrementUsedExaminationCount(): void {
    this._usedExaminationCount += 1;
  }

  incrementUsedControlCount(): void {
    this._usedControlCount += 1;
  }

  toPersistence(): IPatientTreatmentPackage {
    return {
      id: this._id.value,
      patientId: this._patientId.value,
      packageId: this._packageId.value,
      providerId: this._providerId.value,
      paymentId: this._paymentId,
      startDate: this.dateRange.startDate,
      endDate: this.dateRange.endDate,
      notes: this._notes,
      status: this._status,
      usedExaminationCount: this._usedExaminationCount,
      usedControlCount: this._usedControlCount,
      createdAt: this._createdAt,
      updatedAt: DateTimeManager.create(),
    };
  }
}
