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
import {
  CreatePaymentProps,
  RefundInstallmentProps,
} from '@modules/finance/payment/domain/contracts/payment';
import { PaymentRefundedEvent } from '@modules/finance/payment/domain/events/payment-refunded.event';
import {
  LogAction,
  LogType,
} from '@src/domain/constants/log-action.constant';
import { UUID } from '@src/domain/value-objects/uuid.vo';
import { FirebaseUid } from '@src/domain/value-objects/firebase-uid.vo';
import { Guard } from '@common/domain/guards';
import { DateTimeManager } from '@common/infrastructure/date-time/date-time.manager';
import { PaymentRules } from '@modules/finance/payment/domain/rules/payment.rules';
import { ValidateOptionsType } from '@shared/common/validate-options/validate-options.type';

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
      andFind: {
        installmentWithAnId: (installmentId: string) =>
          this.validateAndFindInstallment(installmentId),
      },
      status: {
        isRefunded: this.isRefunded(),
        isCompleted: this.isCompleted(),
        isCancelled: this.isCancelled(),
        isPending: this.isPending(),
        isPartial: this.isPartial(),
      },
    };
  }

  static create(props: CreatePaymentProps): Payment {
    const now = DateTimeManager.create();

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

    const paymentId = UUID.createOrGenerate(props.id).value;

    return new Payment({
      id: paymentId,
      clinicId: UUID.create(props.clinicId).orThrow().value,
      patientId: FirebaseUid.create(props.patientId).orThrow().value,
      appointmentId: UUID.create(props.clinicId).instance?.value ?? null,
      providerId: UUID.create(props.providerId).instance?.value ?? null,
      totalAmount: props.totalAmount.value,
      currency: props.totalAmount.currency,
      status: PaymentStatusSchema.enum.PENDING,
      createdAt: now,
      updatedAt: now,
      installments: props.installments.map((inst) => {
        return {
          id: inst.id,
          paymentId,
          installmentNo: inst.installmentNo,
          amount: inst.money.value,
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

  public rules(validateOptions: ValidateOptionsType) {
    return new PaymentRules(this, validateOptions);
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
      this.validateAndFindInstallment(installmentId).orThrow();
    if (installment.status === InstallmentStatusSchema.enum.COMPLETED) return;

    this.mutateInstallment(installmentId, {
      status: InstallmentStatusSchema.enum.COMPLETED,
      paidAt: DateTimeManager.create(),
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
    this.validateAndFindInstallment(installmentId).orThrow();
    this.mutateInstallment(installmentId, {
      status: InstallmentStatusSchema.enum.CANCELLED,
    });

    const nonCancelledCount = this._installments.filter(
      (i) => i.status !== InstallmentStatusSchema.enum.CANCELLED
    ).length;

    if (nonCancelledCount === 0) {
      this._status = PaymentStatusSchema.enum.CANCELLED;
    }
  }

  refundInstallment({
    installmentId,
    actorId,
    logSource,
    details,
  }: RefundInstallmentProps): void {
    this.validateAndFindInstallment(installmentId).orThrow();
    this.mutateInstallment(installmentId, {
      status: InstallmentStatusSchema.enum.REFUNDED,
    });

    // Ödeme durumu TÜM taksitlerden türetilir — kardeş metodlarla (markAsPaid,
    // cancelInstallment) aynı mantık. Önceden tek taksitin iadesi ödemenin
    // tamamını REFUNDED yapıyordu: 3 taksitli planda 1 taksit iade edilince
    // diğer ikisi hâlâ tahsil edilmiş olduğu halde ödeme "tamamen iade" görünüyor,
    // buna bağlı cari/rapor sorguları geliri sıfırlıyordu.
    const activeInstallments = this._installments.filter(
      (i) => i.status !== InstallmentStatusSchema.enum.CANCELLED
    );
    const allRefunded =
      activeInstallments.length > 0 &&
      activeInstallments.every(
        (i) => i.status === InstallmentStatusSchema.enum.REFUNDED
      );

    this._status = allRefunded
      ? PaymentStatusSchema.enum.REFUNDED
      : PaymentStatusSchema.enum.PARTIAL;

    // Event burada raise edilir; muhasebe ters kaydını (RefundLedgerEntries)
    // tetikleyen tek kaynak budur. Handler'ların ayrıca publish etmesi ters
    // kaydın iki kez çalışmasına yol açıyordu.
    this.addDomainEvent(
      new PaymentRefundedEvent({
        installmentId,
        paymentId: this._id.value,
        appointmentId: this._appointmentId?.value ?? null,
        clinicId: this._clinicId.value,
        actorId,
        source: logSource,
        action: LogAction.PAYMENT_REFUNDED,
        type: LogType.INFO,
        details: details ?? 'Ödeme iade edildi',
      })
    );
  }

  failInstallment(installmentId: string): void {
    this.validateAndFindInstallment(installmentId).orThrow();
    this.mutateInstallment(installmentId, {
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

      totalAmount: this._totalAmount.value,
      currency: this._totalAmount.currency,

      status: this._status,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }

  private isCompleted(): Guard<boolean> {
    const isCompleted = this._status === PaymentStatusSchema.enum.COMPLETED;
    return Guard.monitor(
      isCompleted,
      isCompleted,
      () => new Error('Ödeme durumu "tamamlanmış" değil')
    );
  }

  private isCancelled(): Guard<boolean> {
    const isCancelled = this._status === PaymentStatusSchema.enum.CANCELLED;
    return Guard.monitor(
      isCancelled,
      isCancelled,
      () => new Error('Ödeme durumu "iptal edilmiş" değil')
    );
  }

  private isRefunded(): Guard<boolean> {
    const isRefunded = this._status === PaymentStatusSchema.enum.REFUNDED;
    return Guard.monitor(
      isRefunded,
      isRefunded,
      () => new Error('Ödeme durumu "iade edilmiş" değil')
    );
  }

  private isPending(): Guard<boolean> {
    const isPending = this._status === PaymentStatusSchema.enum.PENDING;
    return Guard.monitor(
      isPending,
      isPending,
      () => new Error('Ödeme durumu "beklemede" değil')
    );
  }

  private isPartial(): Guard<boolean> {
    const isPartial = this._status === PaymentStatusSchema.enum.PARTIAL;
    return Guard.monitor(
      isPartial,
      isPartial,
      () => new Error('Ödeme durumu "kısmi" değil')
    );
  }

  private mutateInstallment(
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

  private recalculateStatusAfterInstallmentChange(): void {
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

  private validateAndFindInstallment(
    installmentId: string
  ): Guard<PaymentInstallment | undefined> {
    const installment = this._installments.find((i) => i.id === installmentId);

    const hasInstallment = !!installment;

    return Guard.monitor(installment, hasInstallment, () =>
      Error(`Taksit bulunamadı: installmentId=${installmentId}`)
    );
  }
}
