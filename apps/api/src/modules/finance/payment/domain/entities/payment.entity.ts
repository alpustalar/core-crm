import {
  Payment as IPayment,
  PaymentInstallment,
  PaymentStatus,
  Prisma,
} from '@prisma/client';
import { AggregateRoot } from '@common/domain/aggregate-root';
import { CreatePaymentProps } from '@modules/finance/payment/domain/types/create-payment.props';
import PaymentMethodSchema from '@input-type-schemas/PaymentMethodSchema';
import PaymentStatusSchema from '@input-type-schemas/PaymentStatusSchema';
import InstallmentStatusSchema from '@input-type-schemas/InstallmentStatusSchema';

export type PaymentWithInstallmentsData = IPayment & {
  installments: PaymentInstallment[];
};

export class Payment extends AggregateRoot implements IPayment {
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

  private _id: string;

  get id(): string {
    return this._id;
  }

  private _clinicId: string;

  get clinicId(): string {
    return this._clinicId;
  }

  private _patientId: string;

  get patientId(): string {
    return this._patientId;
  }

  private _appointmentId: string | null;

  get appointmentId(): string | null {
    return this._appointmentId;
  }

  private _providerId: string | null;

  get providerId(): string | null {
    return this._providerId;
  }

  private _totalAmount: Prisma.Decimal;

  get totalAmount(): Prisma.Decimal {
    return this._totalAmount;
  }

  private _currency: string;

  get currency(): string {
    return this._currency;
  }

  private _status: PaymentStatus;

  get status(): PaymentStatus {
    return this._status;
  }

  private _createdAt: Date;

  get createdAt(): Date {
    return this._createdAt;
  }

  private _updatedAt: Date;

  get updatedAt(): Date {
    return this._updatedAt;
  }

  private _installments: PaymentInstallment[];

  get installments(): readonly PaymentInstallment[] {
    return this._installments;
  }

  private _dirtyInstallmentIds: Set<string> = new Set();

  get dirtyInstallmentIds(): ReadonlySet<string> {
    return this._dirtyInstallmentIds;
  }

  static create(props: CreatePaymentProps): Payment {
    const now = new Date();
    return new Payment({
      id: props.id,
      clinicId: props.clinicId,
      patientId: props.patientId,
      appointmentId: props.appointmentId ?? null,
      providerId: props.providerId ?? null,
      totalAmount: props.totalAmount,
      currency: props.currency,
      status: PaymentStatusSchema.enum.PENDING,
      createdAt: now,
      updatedAt: now,
      installments: props.installments.map((inst) => ({
        id: inst.id,
        paymentId: props.id,
        installmentNo: inst.installmentNo,
        amount: inst.amount,
        currency: inst.currency,
        method: inst.method ?? PaymentMethodSchema.enum.CREDIT_CARD,
        status: InstallmentStatusSchema.enum.PENDING,
        dueDate: inst.dueDate ?? null,
        paidAt: null,
        note: inst.note ?? null,
        createdAt: now,
        updatedAt: now,
      })),
    });
  }

  isCompleted(): boolean {
    return this._status === PaymentStatusSchema.enum.COMPLETED;
  }
  isCancelled(): boolean {
    return this._status === PaymentStatusSchema.enum.CANCELLED;
  }
  isRefunded(): boolean {
    return this._status === PaymentStatusSchema.enum.REFUNDED;
  }
  isPending(): boolean {
    return this._status === PaymentStatusSchema.enum.PENDING;
  }
  isPartial(): boolean {
    return this._status === PaymentStatusSchema.enum.PARTIAL;
  }

  getCompletedInstallment(): PaymentInstallment | undefined {
    return this._installments.find(
      (i) => i.status === InstallmentStatusSchema.enum.COMPLETED
    );
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
    if (installment.status === InstallmentStatusSchema.enum.COMPLETED) return;

    this._mutateInstallment(installmentId, {
      status: InstallmentStatusSchema.enum.COMPLETED,
      paidAt: new Date(),
    });

    const pendingCount = this._installments.filter(
      (i) =>
        i.status !== InstallmentStatusSchema.enum.COMPLETED &&
        i.status !== InstallmentStatusSchema.enum.CANCELLED
    ).length;

    this._status =
      pendingCount === 0
        ? PaymentStatusSchema.enum.COMPLETED
        : PaymentStatusSchema.enum.PARTIAL;
  }

  cancelInstallment(installmentId: string): void {
    this._findInstallmentOrThrow(installmentId);
    this._mutateInstallment(installmentId, {
      status: InstallmentStatusSchema.enum.CANCELLED,
    });

    const nonCancelledCount = this._installments.filter(
      (i) => i.status !== InstallmentStatusSchema.enum.CANCELLED
    ).length;

    if (nonCancelledCount === 0) {
      this._status = PaymentStatusSchema.enum.CANCELLED;
    }
  }

  refundInstallment(installmentId: string): void {
    this._findInstallmentOrThrow(installmentId);
    this._mutateInstallment(installmentId, {
      status: InstallmentStatusSchema.enum.REFUNDED,
    });
    this._status = PaymentStatusSchema.enum.REFUNDED;
  }

  failInstallment(installmentId: string): void {
    this._findInstallmentOrThrow(installmentId);
    this._mutateInstallment(installmentId, {
      status: InstallmentStatusSchema.enum.PENDING,
    });
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
