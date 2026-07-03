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
  InvalidTreatmentPackageCancelException,
  InvalidTreatmentPackageCompletionException,
  InvalidTreatmentPackageResumeException,
  InvalidTreatmentPackageStatusException,
} from '@modules/clinical/treatment-package/domain/exceptions/patient-treatment-package.exceptions';
import { DateTimeManager } from '@common/infrastructure/date-time/date-time.manager';
import { UUID } from '@src/domain/value-objects/uuid.vo';
import { isNotUndefined } from '@common/utils/is-not-undefined';
import { Guard } from '@common/domain/guards';
import { isDefined } from '@common/utils';

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

    this._dateRange = DateRange.create(data.startDate, data.endDate).orThrow();

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

    const isActive = this.isActive;
    const isCompleted = this.isCompleted;
    const isCancelled = this.isCancelled;
    const isSuspended = this.isSuspended;
    const isExpired = self.isExpired;

    const canComplete = this.canComplete;
    const canCancel = this.canCancel;
    const canSuspend = this.canSuspend;
    const canResume = this.canResume;
    const canUncancel = this.canUncancel;
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

  private get isExpired() {
    const { isExpired, isValid } = this._dateRange.validate.expiration;
    return Guard.monitor(
      isExpired,
      isValid,
      new Error('Paketin süresi dolmuş.')
    );
  }

  private get canSuspend() {
    const can = this.isActive.value && !this.isExpired.value;
    return Guard.monitor(can, can, new Error('Bu paket askıya alınamaz'));
  }

  private get canResume() {
    const can = this.isSuspended.value && !this.isExpired.value;
    return Guard.monitor(can, can, new Error('Bu paket devam ettirilemez'));
  }

  private get canUncancel() {
    const can = this.isCancelled.value && !this.isExpired.value;
    return Guard.monitor(
      can,
      can,
      new Error('Bu paket tekrar aktif hale getirilemez')
    );
  }

  private get canComplete() {
    const can = this.isActive.value && !this.isExpired.value;
    return Guard.monitor(can, can, new Error('Bu paket tamamlanabilir değil'));
  }

  private get canCancel() {
    const can = !this.isCompleted.value && !this.isCancelled.value;
    return Guard.monitor(can, can, new Error('Bu paket iptal edilemez.'));
  }

  private get isCompleted() {
    const isComplete =
      this._status === PatientPackageStatusSchema.enum.COMPLETED;
    return Guard.monitor(
      isComplete,
      isComplete,
      new Error('Paket kapalı değil')
    );
  }

  private get isCancelled() {
    const isCancel = this._status === PatientPackageStatusSchema.enum.CANCELLED;
    return Guard.monitor(
      isCancel,
      isCancel,
      new Error('Paket iptal edilmemiş')
    );
  }

  private get isActive() {
    const isActive = this._status === PatientPackageStatusSchema.enum.ACTIVE;
    return Guard.monitor(isActive, isActive, new Error('Paket aktif değil'));
  }

  private get isSuspended() {
    const isSuspend =
      this._status === PatientPackageStatusSchema.enum.SUSPENDED;
    return Guard.monitor(
      isSuspend,
      isSuspend,
      new Error('Paket askıya alınmamış')
    );
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
    if (isDefined(props.status) && props.status !== this._status) {
      const statusTransitionMap: Record<PatientPackageStatus, () => void> = {
        [PatientPackageStatusSchema.enum.SUSPENDED]: () => {
          if (!this.validate.lifecycle.canSuspend.value)
            throw new InvalidTreatmentPackageStatusException(
              this.status,
              this.id.value
            );
        },
        [PatientPackageStatusSchema.enum.COMPLETED]: () => {
          if (!this.validate.lifecycle.canComplete.value)
            throw new InvalidTreatmentPackageCompletionException(
              this.status,
              this.id.value
            );
        },
        [PatientPackageStatusSchema.enum.CANCELLED]: () => {
          if (!this.validate.lifecycle.canCancel.value)
            throw new InvalidTreatmentPackageCancelException(
              this.status,
              this.id.value
            );
        },
        [PatientPackageStatusSchema.enum.ACTIVE]: () => {
          const canTransition = this.validate.status.isSuspended.value
            ? this.validate.lifecycle.canResume.value
            : this.validate.lifecycle.canUncancel.value;

          if (!canTransition) {
            throw new Error(
              'Paket mevcut durumundan aktif duruma geçirilemez.'
            );
          }
        },
      };

      const transitionGuard = statusTransitionMap[props.status];
      if (transitionGuard) {
        transitionGuard();
      }

      this._status = props.status;
    }

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

  complete(): void {
    this._status = PatientPackageStatusSchema.enum.COMPLETED;
  }

  cancel(): void {
    this._status = PatientPackageStatusSchema.enum.CANCELLED;
  }

  reactivate(): void {
    if (this.isCancelled.value) {
      throw new Error(
        'Sadece iptal edilmiş paketler yeniden etkinleştirilebilir.'
      );
    }
    this._status = PatientPackageStatusSchema.enum.ACTIVE;
    this._updatedAt = DateTimeManager.create();
  }

  suspend(): void {
    if (!this.isActive.value) {
      throw new InvalidTreatmentPackageStatusException(
        this.status,
        this.id.value
      );
    }
    this._status = PatientPackageStatusSchema.enum.SUSPENDED;
  }

  resume(): void {
    if (!this.isSuspended.value) {
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
