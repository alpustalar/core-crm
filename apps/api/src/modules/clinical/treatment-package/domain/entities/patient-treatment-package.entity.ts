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

export class PatientTreatmentPackage
  extends AggregateRoot
  implements IPatientTreatmentPackage
{
  constructor(data: IPatientTreatmentPackage) {
    super();
    this._id = data.id;
    this._patientId = data.patientId;
    this._packageId = data.packageId;
    this._providerId = data.providerId;
    this._paymentId = data.paymentId ?? null;
    this._startDate = data.startDate;
    this._endDate = data.endDate;
    this._notes = data.notes ?? null;
    this._status = data.status;
    this._usedExaminationCount = data.usedExaminationCount;
    this._usedControlCount = data.usedControlCount;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
  }

  private _id: string;
  get id(): string {
    return this._id;
  }

  private _patientId: string;
  get patientId(): string {
    return this._patientId;
  }

  private _packageId: string;
  get packageId(): string {
    return this._packageId;
  }

  private _providerId: string;
  get providerId(): string {
    return this._providerId;
  }

  private _paymentId: string | null;
  get paymentId(): string | null {
    return this._paymentId;
  }

  private _startDate: Date;
  get startDate(): Date {
    return this._startDate;
  }

  private _endDate: Date;
  get endDate(): Date {
    return this._endDate;
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
    return this._endDate < new Date();
  }

  static create(props: IPatientTreatmentPackage): PatientTreatmentPackage {
    if (props.endDate <= props.startDate) {
      throw new Error(
        'Paket bitiş tarihi, başlangıç tarihinden önce veya başlangıç tarihine eşit olamaz.'
      );
    }

    const now = new Date();

    return new PatientTreatmentPackage({
      id: props.id,
      patientId: props.patientId,
      packageId: props.packageId,
      providerId: props.providerId,
      paymentId: props.paymentId ?? null,
      startDate: props.startDate,
      endDate: props.endDate,
      notes: props.notes ?? null,

      status: PatientPackageStatusSchema.enum.ACTIVE,
      usedExaminationCount: 0,
      usedControlCount: 0,

      createdAt: now,
      updatedAt: now,
    });
  }

  complete(): void {
    if (this._status !== PatientPackageStatusSchema.enum.ACTIVE) {
      throw new Error('Yalnızca aktif paketler tamamlanabilir.');
    }
    this._status = PatientPackageStatusSchema.enum.COMPLETED;
  }

  cancel(): void {
    if (
      this._status === PatientPackageStatusSchema.enum.COMPLETED ||
      this._status === PatientPackageStatusSchema.enum.CANCELLED
    ) {
      throw new Error(
        'Tamamlanan veya zaten iptal edilmiş paketler iptal edilemez.'
      );
    }
    this._status = PatientPackageStatusSchema.enum.CANCELLED;
  }

  suspend(): void {
    if (this._status !== PatientPackageStatusSchema.enum.ACTIVE) {
      throw new Error('Yalnızca aktif paketler askıya alınabilir.');
    }
    this._status = PatientPackageStatusSchema.enum.SUSPENDED;
  }

  resume(): void {
    if (this._status !== PatientPackageStatusSchema.enum.SUSPENDED) {
      throw new Error(
        'Yalnızca askıya alınmış paketler yeniden aktive edilebilir.'
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
      id: this._id,
      patientId: this._patientId,
      packageId: this._packageId,
      providerId: this._providerId,
      paymentId: this._paymentId,
      startDate: this._startDate,
      endDate: this._endDate,
      notes: this._notes,
      status: this._status,
      usedExaminationCount: this._usedExaminationCount,
      usedControlCount: this._usedControlCount,
      createdAt: this._createdAt,
      updatedAt: new Date(),
    };
  }
}
