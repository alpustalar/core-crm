import { ClinicPaymentGateway as IClinicPaymentGateway } from '@shared/generated-zod';
import { AggregateRoot } from '@common/domain/aggregate-root';
import { CreateClinicPaymentGatewayProps } from '@modules/finance/payment-gateway/domain/contracts/payment-gateway.contracts';
import { UUID } from '@src/domain/value-objects/uuid.vo';
import { DateTimeManager } from '@common/infrastructure/date-time/date-time.manager';

/**
 * Kliniğin ödeme altyapısı (finance bounded-context). Clinic'ten ayrıştırılmış
 * 1:1 satellite; Iyzico marketplace alt üye işyeri anahtarını barındırır.
 */
export class ClinicPaymentGateway extends AggregateRoot {
  constructor(data: IClinicPaymentGateway) {
    super();
    this._id = UUID.fromTrusted(data.id);
    this._iyzicoSubMerchantKey = data.iyzicoSubMerchantKey;
    this._clinicId = UUID.fromTrusted(data.clinicId);
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
  }

  private _id: UUID;
  get id(): UUID {
    return this._id;
  }

  private _iyzicoSubMerchantKey: string;
  get iyzicoSubMerchantKey(): string {
    return this._iyzicoSubMerchantKey;
  }

  private _clinicId: UUID;
  get clinicId(): UUID {
    return this._clinicId;
  }

  private _createdAt: Date;
  get createdAt(): Date {
    return this._createdAt;
  }

  private _updatedAt: Date;
  get updatedAt(): Date {
    return this._updatedAt;
  }

  public static create(
    props: CreateClinicPaymentGatewayProps
  ): ClinicPaymentGateway {
    const now = DateTimeManager.create();

    return new ClinicPaymentGateway({
      id: UUID.createOrGenerate(props.id).value,
      clinicId: UUID.create(props.clinicId).orThrow().value,
      iyzicoSubMerchantKey: props.iyzicoSubMerchantKey,
      createdAt: now,
      updatedAt: now,
    });
  }

  /** Iyzico alt üye işyeri anahtarını günceller (yeniden kayıt akışı). */
  public updateSubMerchantKey(key: string): void {
    this._iyzicoSubMerchantKey = key;
  }

  public toPersistence(): IClinicPaymentGateway {
    return {
      id: this._id.value,
      iyzicoSubMerchantKey: this._iyzicoSubMerchantKey,
      clinicId: this._clinicId.value,
      createdAt: this._createdAt,
      updatedAt: DateTimeManager.create(),
    };
  }
}
