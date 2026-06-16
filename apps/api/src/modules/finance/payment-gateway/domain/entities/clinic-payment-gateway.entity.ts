import { ClinicPaymentGateway as IClinicPaymentGateway } from '@prisma/client';
import { AggregateRoot } from '@common/domain/aggregate-root';
import { CreateClinicPaymentGatewayProps } from '../types/create-clinic-payment-gateway.props';

/**
 * Kliniğin ödeme altyapısı (finance bounded-context). Clinic'ten ayrıştırılmış
 * 1:1 satellite; Iyzico marketplace alt üye işyeri anahtarını barındırır.
 */
export class ClinicPaymentGateway
  extends AggregateRoot
  implements IClinicPaymentGateway
{
  constructor(data: IClinicPaymentGateway) {
    super();
    this._id = data.id;
    this._iyzicoSubMerchantKey = data.iyzicoSubMerchantKey;
    this._clinicId = data.clinicId;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
  }

  private _id: string;
  get id(): string {
    return this._id;
  }

  private _iyzicoSubMerchantKey: string;
  get iyzicoSubMerchantKey(): string {
    return this._iyzicoSubMerchantKey;
  }

  private _clinicId: string;
  get clinicId(): string {
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
    const now = new Date();
    return new ClinicPaymentGateway({
      id: props.id ?? crypto.randomUUID(),
      clinicId: props.clinicId,
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
      id: this._id,
      iyzicoSubMerchantKey: this._iyzicoSubMerchantKey,
      clinicId: this._clinicId,
      createdAt: this._createdAt,
      updatedAt: new Date(),
    };
  }
}
