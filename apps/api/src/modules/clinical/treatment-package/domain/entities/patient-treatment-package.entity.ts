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
  InvalidTreatmentPackageBulkUpdateException,
  InvalidTreatmentPackageCancelException,
  InvalidTreatmentPackageCompletionException,
  InvalidTreatmentPackageResumeException,
  InvalidTreatmentPackageStatusException,
} from '@modules/clinical/treatment-package/domain/exceptions/patient-treatment-package.exceptions';
import { DateTimeManager } from '@common/infrastructure/date-time/date-time.manager';
import { UUID } from '@src/domain/value-objects/uuid.vo';

export class PatientTreatmentPackage extends AggregateRoot {
  constructor(data: IPatientTreatmentPackage) {
    super();

    this._id = UUID.fromTrusted(data.id);
    this._patientId = data.patientId;
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

  private _patientId: string;
  get patientId(): string {
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

  get isActive(): boolean {
    return this._status === PatientPackageStatusSchema.enum.ACTIVE;
  }

  get isExpired(): boolean {
    return this._dateRange.endDate < new Date();
  }

  static create(
    props: CreatePatientTreatmentPackageProps
  ): PatientTreatmentPackage {
    const now = DateTimeManager.create();

    const dateRange = DateRange.create(
      props.startDate,
      props.endDate
    ).orThrow();

    const id = UUID.create(props.id).orThrow() ?? UUID.generate();

    return new PatientTreatmentPackage({
      id: id.value,
      patientId: props.patientId,
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
    if (props.status && props.status !== this._status) {
      if (
        this._status === PatientPackageStatusSchema.enum.COMPLETED ||
        this._status === PatientPackageStatusSchema.enum.CANCELLED
      ) {
        throw new InvalidTreatmentPackageBulkUpdateException(
          this.status,
          props.status,
          this.id.value
        );
      }
      this._status = props.status;
    }

    if (props.providerId !== undefined) {
      this._providerId = UUID.create(props.providerId).orThrow();
    }

    if (props.notes !== undefined) {
      this._notes = props.notes;
    }

    if (props.startDate !== undefined || props.endDate !== undefined) {
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
    if (this._status !== PatientPackageStatusSchema.enum.ACTIVE) {
      throw new InvalidTreatmentPackageCompletionException(
        this.status,
        this.id.value
      );
    }
    this._status = PatientPackageStatusSchema.enum.COMPLETED;
  }

  cancel(): void {
    if (
      this._status === PatientPackageStatusSchema.enum.COMPLETED ||
      this._status === PatientPackageStatusSchema.enum.CANCELLED
    ) {
      throw new InvalidTreatmentPackageCancelException(
        this.status,
        this.id.value
      );
    }
    this._status = PatientPackageStatusSchema.enum.CANCELLED;
  }

  suspend(): void {
    if (this._status !== PatientPackageStatusSchema.enum.ACTIVE) {
      throw new InvalidTreatmentPackageStatusException(
        this.status,
        this.id.value
      );
    }
    this._status = PatientPackageStatusSchema.enum.SUSPENDED;
  }

  resume(): void {
    if (this._status !== PatientPackageStatusSchema.enum.SUSPENDED) {
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
      patientId: this._patientId,
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
