import { Payment as IPayment } from '@shared/generated-zod';
import { PaymentInstallment } from '@shared/generated-zod/modelSchema/PaymentInstallmentSchema';
import PaymentStatusSchema, {
  PaymentStatusType as PaymentStatus,
} from '@input-type-schemas/PaymentStatusSchema';
import { AggregateRoot } from '@common/domain/aggregate-root';
import PaymentMethodSchema from '@input-type-schemas/PaymentMethodSchema';
import InstallmentStatusSchema from '@input-type-schemas/InstallmentStatusSchema';
import { Money } from '@src/domain/value-objects/money.vo';
import {
  InstallmentTotalMismatchException,
  InvalidInstallmentPlanException,
} from '@modules/finance/payment/domain/exceptions/payment.exceptions';
import { CreatePaymentProps } from '@modules/finance/payment/domain/payment.contracts';
import { UUID } from '@src/domain/value-objects/uuid.vo';
import { FirebaseUid } from '@src/domain/value-objects/firebase-uid.vo';
import { Guard } from '@common/domain/guards';
import { DateTimeManager } from '@common/infrastructure/date-time/date-time.manager';

export type PaymentWithInstallmentsData = IPayment & {
  installments: PaymentInstallment[];
};

export class Payment extends AggregateRoot {
  constructor(data: PaymentWithInstallmentsData) {
    super();
    this._id = UUID.create(data.id).orThrow();
    this._clinicId = UUID.create(data.clinicId).orThrow();
    this._patientId = FirebaseUid.create(data.patientId).orThrow();
    this._appointmentId = UUID.create(data.appointmentId).instance ?? null;
    this._providerId = UUID.create(data.providerId).instance ?? null;
    this._totalAmount = Money.create(data.totalAmount, data.currency).orThrow();
    this._status = data.status;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
    this._installments = [...data.installments];
  }

  private _id: UUID;

  get id(): UUID {
    return this._id;
  }

  private _clinicId: UUID;

  get clinicId(): UUID {
    return this._clinicId;
  }

  private _patientId: FirebaseUid;

  get patientId(): FirebaseUid {
    return this._patientId;
  }

  private _appointmentId: UUID | null;

  get appointmentId(): UUID | null {
    return this._appointmentId;
  }

  private _providerId: UUID | null;

  get providerId(): UUID | null {
    return this._providerId;
  }

  private _totalAmount: Money;

  get totalAmount(): Money {
    return this._totalAmount;
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

  public get validate() {
    return {
      and: {
        getInstallmentWithAnId: (installmentId: string) =>
          this._validateAndFindInstallment(installmentId),
      },
      status: {
        isRefunded: this._isRefunded(),
        isCompleted: this._isCompleted(),
        isCancelled: this._isCancelled(),
        isPending: this._isPending(),
        isPartial: this._isPartial(),
        can: {
          cancel: this._canCancel(),
          refund: this._canRefund(),
        },
      },
    };
  }

  static create(props: CreatePaymentProps): Payment {
    const now = new Date();

    if (!props.installments || props.installments.length === 0) {
      throw new InvalidInstallmentPlanException();
    }

    const totalInstallmentMoney = props.installments
      .map((inst) => inst.money)
      .reduce((total, current) => total.add(current));

    if (!props.totalAmount.equals(totalInstallmentMoney)) {
      throw new InstallmentTotalMismatchException(
        'Finansal Tutarsızlık: Taksitlerin toplamı ana ödeme tutarı ile eşleşmiyor!',
        {
          propsCurrency: props.totalAmount.currency,
          propsTotalAmount: props.totalAmount.toApiFormat(),
          totalInstallmentAmount: totalInstallmentMoney.toApiFormat(),
          totalInstallmentCurrency: totalInstallmentMoney.currency,
        }
      );
    }

    const paymentId =
      UUID.create(props.id).instance?.value ?? UUID.generate().value;

    return new Payment({
      id: paymentId,
      clinicId: UUID.create(props.clinicId).orThrow().value,
      patientId: FirebaseUid.create(props.patientId).orThrow().value,
      appointmentId: UUID.create(props.clinicId).instance?.value ?? null,
      providerId: UUID.create(props.providerId).instance?.value ?? null,
      totalAmount: props.totalAmount.amount,
      currency: props.totalAmount.currency,
      status: PaymentStatusSchema.enum.PENDING,
      createdAt: now,
      updatedAt: now,
      installments: props.installments.map((inst) => {
        return {
          id: inst.id,
          paymentId,
          installmentNo: inst.installmentNo,
          amount: inst.money.amount,
          currency: inst.money.currency,
          method: inst.method ?? PaymentMethodSchema.enum.CREDIT_CARD,
          status: InstallmentStatusSchema.enum.PENDING,
          dueDate: inst.dueDate ?? null,
          paidAt: null,
          note: inst.note ?? null,
          createdAt: now,
          updatedAt: now,
        };
      }),
    });
  }

  getCompletedInstallments(): Guard<PaymentInstallment[] | undefined> {
    const installment = this._installments.filter(
      (i) => i.status === InstallmentStatusSchema.enum.COMPLETED
    );

    const has = !!installment;

    return Guard.monitor(
      installment,
      has,
      () => new Error('Ödemesi tamamlanmış taksit bulunamadı')
    );
  }

  completeInstallment(installmentId: string): void {
    const installment =
      this._validateAndFindInstallment(installmentId).orThrow();
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
    this._validateAndFindInstallment(installmentId).orThrow();
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
    this._validateAndFindInstallment(installmentId).orThrow();
    this._mutateInstallment(installmentId, {
      status: InstallmentStatusSchema.enum.REFUNDED,
    });
    this._status = PaymentStatusSchema.enum.REFUNDED;
  }

  failInstallment(installmentId: string): void {
    this._validateAndFindInstallment(installmentId).orThrow();
    this._mutateInstallment(installmentId, {
      status: InstallmentStatusSchema.enum.PENDING,
    });
  }

  toPersistence(): IPayment {
    return {
      id: this._id.value,
      clinicId: this._clinicId.value,
      patientId: this._patientId.value,
      appointmentId: this._appointmentId?.value ?? null,
      providerId: this._providerId?.value ?? null,

      totalAmount: this._totalAmount.amount,
      currency: this._totalAmount.currency,

      status: this._status,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }

  private _isCompleted(): Guard<boolean> {
    const isCompleted = this._status === PaymentStatusSchema.enum.COMPLETED;
    return Guard.monitor(
      isCompleted,
      isCompleted,
      () => new Error('Ödeme durumu "tamamlanmış" değil')
    );
  }

  private _isCancelled(): Guard<boolean> {
    const isCancelled = this._status === PaymentStatusSchema.enum.CANCELLED;
    return Guard.monitor(
      isCancelled,
      isCancelled,
      () => new Error('Ödeme durumu "iptal edilmiş" değil')
    );
  }

  private _isRefunded(): Guard<boolean> {
    const isRefunded = this._status === PaymentStatusSchema.enum.REFUNDED;
    return Guard.monitor(
      isRefunded,
      isRefunded,
      () => new Error('Ödeme durumu "iade edilmiş" değil')
    );
  }

  private _isPending(): Guard<boolean> {
    const isPending = this._status === PaymentStatusSchema.enum.PENDING;
    return Guard.monitor(
      isPending,
      isPending,
      () => new Error('Ödeme durumu "beklemede" değil')
    );
  }

  private _isPartial(): Guard<boolean> {
    const isPartial = this._status === PaymentStatusSchema.enum.PARTIAL;
    return Guard.monitor(
      isPartial,
      isPartial,
      () => new Error('Ödeme durumu "kısmi" değil')
    );
  }

  private _canRefund() {
    const can = !this._isCancelled().value && !this._isPending().value;
    return Guard.monitor(
      can,
      can,
      () =>
        new Error(
          `İptal edilmiş veya bekleyen ödemeler iade edilemez. Mevcut durum: ${this._status}`
        )
    );
  }

  private _canCancel() {
    const can = !this._isCompleted().value && !this._isRefunded().value;

    return Guard.monitor(
      can,
      can,
      () =>
        new Error(
          `Tamamlanmış veya iade süreci başlamış ödemeler iptal edilemez. İade metodunu kullanın. Mevcut durum: ${this._status}`
        )
    );
  }

  private _mutateInstallment(
    installmentId: string,
    patch: Partial<PaymentInstallment>
  ): void {
    const now = DateTimeManager.create();
    this._installments = this._installments.map((i) =>
      i.id === installmentId ? { ...i, ...patch, updatedAt: now } : i
    );
    this._dirtyInstallmentIds.add(installmentId);
    this._updatedAt = now; // Ana aggregate'in de güncellenme tarihini tetikle
  }

  private _recalculateStatusAfterInstallmentChange(): void {
    const totalCount = this._installments.length;
    const completedCount = this._installments.filter(
      (i) => i.status === InstallmentStatusSchema.enum.COMPLETED
    ).length;
    const cancelledCount = this._installments.filter(
      (i) => i.status === InstallmentStatusSchema.enum.CANCELLED
    ).length;
    const refundedCount = this._installments.filter(
      (i) => i.status === InstallmentStatusSchema.enum.REFUNDED
    ).length;

    // Eğer tüm taksitler iptal edildiyse veya iade edildiyse
    if (cancelledCount === totalCount) {
      this._status = PaymentStatusSchema.enum.CANCELLED;
      return;
    }
    if (refundedCount === totalCount) {
      this._status = PaymentStatusSchema.enum.REFUNDED;
      return;
    }

    // Aktif (iptal/iade edilmemiş) tüm taksitler ödendiyse COMPLETED
    if (completedCount + cancelledCount + refundedCount === totalCount) {
      this._status = PaymentStatusSchema.enum.COMPLETED;
    } else if (completedCount > 0 || refundedCount > 0) {
      // En az bir başarı ödeme veya kısmi iade varsa PARTIAL
      this._status = PaymentStatusSchema.enum.PARTIAL;
    } else {
      this._status = PaymentStatusSchema.enum.PENDING;
    }
  }

  private _validateAndFindInstallment(
    installmentId: string
  ): Guard<PaymentInstallment | undefined> {
    const installment = this._installments.find((i) => i.id === installmentId);

    const hasInstallment = !!installment;

    return Guard.monitor(installment, hasInstallment, () =>
      Error(`Taksit bulunamadı: installmentId=${installmentId}`)
    );
  }
}
