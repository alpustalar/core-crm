import { Module as IModule } from '@shared';
import { UUID } from '@src/domain/value-objects/uuid.vo';
import { Money } from '@src/domain/value-objects/money.vo';
import { Decimal } from 'decimal.js';
import { ModuleCreateProps } from '@modules/platform/subscription/domain/subscription.contracts';
import { CurrencyType } from '@input-type-schemas/CurrencySchema';
import { Currency } from '@src/domain/value-objects/currency.vo';

export class Module {
  constructor(data: IModule) {
    this._id = UUID.fromTrusted(data.id);
    this._key = data.key;
    this._name = data.name;
    this._description = data.description;

    this._monthlyMoney = Money.fromTrusted(data.monthlyPrice, data.currency);

    this._isActive = data.isActive;
  }

  private _id: UUID;
  get id(): UUID {
    return this._id;
  }

  private _key: string;
  get key(): string {
    return this._key;
  }

  private _name: string;
  get name(): string {
    return this._name;
  }

  private _description: string | null;
  get description(): string | null {
    return this._description;
  }

  private _monthlyMoney: Money;
  get monthlyMoney(): Money {
    return this._monthlyMoney;
  }

  private _monthlyPrice: Decimal;
  get monthlyPrice(): Decimal {
    return this._monthlyMoney.amount;
  }

  private _currency: Currency;
  get currency(): Currency {
    return Currency.fromTrusted(this._monthlyMoney.currency);
  }

  private _isActive: boolean;
  get isActive(): boolean {
    return this._isActive;
  }

  public static create(props: ModuleCreateProps): Module {
    const monthlyMoney = Money.create(
      props.monthlyPrice,
      props.currency
    ).orThrow();

    const moduleId = props.id
      ? UUID.create(props.id).orThrow()
      : UUID.generate();

    return new Module({
      id: moduleId.value,
      key: props.key.toUpperCase().trim(),
      name: props.name.trim(),
      description: props.description ?? null,
      monthlyPrice: monthlyMoney.amount,
      currency: monthlyMoney.currency,
      isActive: true,
    });
  }

  /**
   *  Modül fiyatını veya para birimini güncelleme davranışı
   */
  public updatePrice(newPrice: number, currency?: CurrencyType): void {
    const curr = currency ?? this._monthlyMoney.currency;
    this._monthlyMoney = Money.create(newPrice, curr).orThrow();
  }

  /**
   *  Modülü satışa kapat / deaktif et
   */
  public deactivate(): void {
    this._isActive = false;
  }

  /**
   *  Modülü satışa aç / aktif et
   */
  public activate(): void {
    this._isActive = true;
  }

  public toPersistence(): IModule {
    return {
      id: this._id.value,
      key: this._key,
      name: this._name,
      description: this._description,
      monthlyPrice: this._monthlyPrice,
      currency: this._currency.value,
      isActive: this._isActive,
    };
  }
}
