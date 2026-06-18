import { TaxParameter as ITaxParameter } from '@shared';
import { Decimal } from 'decimal.js';
import { randomUUID } from 'crypto';
import { BadRequestException } from '@nestjs/common';
import { AggregateRoot } from '@common/domain/aggregate-root';
import { CreateTaxParameterProps } from '../types/set-tax-parameter.props';
import { TaxParameterKeyType as TaxParameterKey } from '@input-type-schemas/TaxParameterKeySchema';

/**
 * Parametrik vergi oranı. (clinicId, key) için tarih-versiyonlu bir oran satırı.
 * `validTo = null` → hâlâ yürürlükteki (açık) sürüm. Yeni oran açılınca eski sürüm
 * `close()` ile kapatılır; geçmiş dönemler doğru hesaplansın diye satır silinmez.
 */
export class TaxParameter extends AggregateRoot {
  constructor(data: ITaxParameter) {
    super();
    this._id = data.id;
    this._clinicId = data.clinicId;
    this._organizationId = data.organizationId;
    this._key = data.key;
    this._rate = data.rate;
    this._validFrom = data.validFrom;
    this._validTo = data.validTo;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
  }

  private _id: string;
  get id(): string {
    return this._id;
  }

  private _clinicId: string;
  get clinicId(): string {
    return this._clinicId;
  }

  private _organizationId: string;
  get organizationId(): string {
    return this._organizationId;
  }

  private _key: TaxParameterKey;
  get key(): TaxParameterKey {
    return this._key;
  }

  private _rate: Decimal;
  get rate(): Decimal {
    return this._rate;
  }

  private _validFrom: Date;
  get validFrom(): Date {
    return this._validFrom;
  }

  private _validTo: Date | null;
  get validTo(): Date | null {
    return this._validTo;
  }

  private _createdAt: Date;
  get createdAt(): Date {
    return this._createdAt;
  }

  private _updatedAt: Date;
  get updatedAt(): Date {
    return this._updatedAt;
  }

  /** Oranın sayısal (yüzde) değeri. */
  get rateNumber(): number {
    return this._rate.toNumber();
  }

  public static create(props: CreateTaxParameterProps): TaxParameter {
    TaxParameter.assertValidRate(props.rate);
    if (props.validTo && props.validTo <= props.validFrom) {
      throw new BadRequestException(
        'validTo, validFrom tarihinden sonra olmalıdır.'
      );
    }

    const now = new Date();
    return new TaxParameter({
      id: randomUUID(),
      clinicId: props.clinicId,
      organizationId: props.organizationId,
      key: props.key,
      rate: new Decimal(props.rate),
      validFrom: props.validFrom,
      validTo: props.validTo ?? null,
      createdAt: now,
      updatedAt: now,
    });
  }

  private static assertValidRate(rate: number): void {
    if (Number.isNaN(rate) || rate < 0 || rate > 100) {
      throw new BadRequestException('Vergi oranı 0-100 arasında olmalıdır.');
    }
  }

  /** Yeni bir oran yürürlüğe girince bu (açık) sürümü kapatır. */
  public close(validTo: Date): void {
    if (this._validTo) return;
    if (validTo < this._validFrom) {
      throw new BadRequestException(
        'Kapanış tarihi başlangıç tarihinden önce olamaz.'
      );
    }
    this._validTo = validTo;
    this._updatedAt = new Date();
  }

  /** Verilen tarihte bu oran yürürlükte mi? */
  public isEffectiveAt(date: Date): boolean {
    if (date < this._validFrom) return false;
    return this._validTo === null || date <= this._validTo;
  }

  public toPersistence(): ITaxParameter {
    return {
      id: this._id,
      clinicId: this._clinicId,
      organizationId: this._organizationId,
      key: this._key,
      rate: this._rate,
      validFrom: this._validFrom,
      validTo: this._validTo,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
