import {
  InstallmentStatus,
  Payment as IPayment,
  PaymentInstallment,
  PaymentStatus,
  Prisma,
} from '@prisma/client';
import { AggregateRoot } from '@common/domain/aggregate-root';

export type PaymentWithInstallmentsData = IPayment & { installments: PaymentInstallment[] };

export class Payment extends AggregateRoot implements IPayment {
  private _id: string;
  private _clinicId: string;
  private _patientId: string;
  private _appointmentId: string | null;
  private _providerId: string | null;
  private _totalAmount: Prisma.Decimal;
  private _currency: string;
  private _status: PaymentStatus;
  private _createdAt: Date;
  private _updatedAt: Date;
  private _installments: PaymentInstallment[];
  private _dirtyInstallmentIds: Set<string> = new Set();

  constructor(data: PaymentWithInstallmentsData) {
    super();
    this._id = data.id;
    this._clinicId = data.clinicId;
    this._patientId = data.patientId;
    this._appointmentId = data.appointmentId;
    this._providerId = data.providerId;
    this._totalAmount = data.totalAmount;
    this._currency = data.currency;
    this._status = data.status;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
    this._installments = [...data.installments];
  }

  get id(): string { return this._id; }
  get clinicId(): string { return this._clinicId; }
  get patientId(): string { return this._patientId; }
  get appointmentId(): string | null { return this._appointmentId; }
  get providerId(): string | null { return this._providerId; }
  get totalAmount(): Prisma.Decimal { return this._totalAmount; }
  get currency(): string { return this._currency; }
  get status(): PaymentStatus { return this._status; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }
  get installments(): readonly PaymentInstallment[] { return this._installments; }
  get dirtyInstallmentIds(): ReadonlySet<string> { return this._dirtyInstallmentIds; }

  isCompleted(): boolean { return this._status === PaymentStatus.COMPLETED; }
  isCancelled(): boolean { return this._status === PaymentStatus.CANCELLED; }
  isRefunded(): boolean { return this._status === PaymentStatus.REFUNDED; }
  isPending(): boolean { return this._status === PaymentStatus.PENDING; }
  isPartial(): boolean { return this._status === PaymentStatus.PARTIAL; }

  getCompletedInstallment(): PaymentInstallment | undefined {
    return this._installments.find((i) => i.status === InstallmentStatus.COMPLETED);
  }

  validateRefundEligibilityOrThrow(): void {
    if (!this.isCompleted()) {
      throw new Error(
        `Yalnızca tamamlanmış ödemeler iade edilebilir. Mevcut durum: ${this._status}`
      );
    }
  }

  validateCancellationOrThrow(): void {
    if (!this.isCompleted()) {
      throw new Error(
        `Yalnızca tamamlanmış ödemeler iptal edilebilir. Mevcut durum: ${this._status}`
      );
    }
  }

  completeInstallment(installmentId: string): void {
    const installment = this._findInstallmentOrThrow(installmentId);
    if (installment.status === InstallmentStatus.COMPLETED) return;

    this._mutateInstallment(installmentId, {
      status: InstallmentStatus.COMPLETED,
      paidAt: new Date(),
    });

    const pendingCount = this._installments.filter(
      (i) =>
        i.status !== InstallmentStatus.COMPLETED &&
        i.status !== InstallmentStatus.CANCELLED
    ).length;

    this._status = pendingCount === 0 ? PaymentStatus.COMPLETED : PaymentStatus.PARTIAL;
  }

  cancelInstallment(installmentId: string): void {
    this._findInstallmentOrThrow(installmentId);
    this._mutateInstallment(installmentId, { status: InstallmentStatus.CANCELLED });

    const nonCancelledCount = this._installments.filter(
      (i) => i.status !== InstallmentStatus.CANCELLED
    ).length;

    if (nonCancelledCount === 0) {
      this._status = PaymentStatus.CANCELLED;
    }
  }

  refundInstallment(installmentId: string): void {
    this._findInstallmentOrThrow(installmentId);
    this._mutateInstallment(installmentId, { status: InstallmentStatus.REFUNDED });
    this._status = PaymentStatus.REFUNDED;
  }

  failInstallment(installmentId: string): void {
    this._findInstallmentOrThrow(installmentId);
    this._mutateInstallment(installmentId, { status: InstallmentStatus.PENDING });
  }

  toPersistence(): IPayment {
    return {
      id: this._id,
      clinicId: this._clinicId,
      patientId: this._patientId,
      appointmentId: this._appointmentId,
      providerId: this._providerId,
      totalAmount: this._totalAmount,
      currency: this._currency,
      status: this._status,
      createdAt: this._createdAt,
      updatedAt: new Date(),
    };
  }

  private _mutateInstallment(
    installmentId: string,
    patch: Partial<PaymentInstallment>
  ): void {
    this._installments = this._installments.map((i) =>
      i.id === installmentId ? { ...i, ...patch } : i
    );
    this._dirtyInstallmentIds.add(installmentId);
  }

  private _findInstallmentOrThrow(installmentId: string): PaymentInstallment {
    const installment = this._installments.find((i) => i.id === installmentId);
    if (!installment) {
      throw new Error(`Taksit bulunamadı: installmentId=${installmentId}`);
    }
    return installment;
  }
}
