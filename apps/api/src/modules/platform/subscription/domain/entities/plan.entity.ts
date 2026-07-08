import { Plan as IPlan } from '@shared';
import { Decimal } from 'decimal.js';
import { UUID } from '@src/domain/value-objects/uuid.vo';
import { Money } from '@src/domain/value-objects/money.vo';
import { Currency } from '@src/domain/value-objects/currency.vo';
import { PlanIdType as PlanId } from '@input-type-schemas/PlanIdSchema';
import { CurrencyType } from '@input-type-schemas/CurrencySchema';
import { DateTimeManager } from '@common/utils';
import { CreatePlanProps } from '@modules/platform/subscription/domain/subscription.contracts';
import { Name } from '@src/domain/value-objects/name.vo';

/**
 * Plan tanımı (sabit PlanId'ye bağlı, admin-düzenlenebilir). Fiyat + isim taşır; içerdiği
 * modüller PlanModule join'i üzerinden yönetilir (repo.setModules). Bundle fiyatı plan
 * fiyatıdır — dahil modüller plan içinde ekstra ücretlendirilmez.
 */
export class Plan {
  constructor(data: IPlan) {
    this._id = UUID.fromTrusted(data.id);
    this._planId = data.planId;
    this._name = Name.fromTrusted(data.name);
    this._monthlyMoney = Money.fromTrusted(data.monthlyPrice, data.currency);
    this._isActive = data.isActive;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
  }

  private _id: UUID;
  get id(): UUID {
    return this._id;
  }

  private _planId: PlanId;
  get planId(): PlanId {
    return this._planId;
  }

  private _name: Name;
  get name(): Name {
    return this._name;
  }

  private _monthlyMoney: Money;
  get monthlyMoney(): Money {
    return this._monthlyMoney;
  }

  get monthlyPrice(): Decimal {
    return this._monthlyMoney.amount;
  }

  get currency(): Currency {
    return Currency.fromTrusted(this._monthlyMoney.currency);
  }

  private _isActive: boolean;
  get isActive(): boolean {
    return this._isActive;
  }

  private _createdAt: Date;
  get createdAt(): Date {
    return this._createdAt;
  }

  private _updatedAt: Date;
  get updatedAt(): Date {
    return this._updatedAt;
  }

  public static create(props: CreatePlanProps): Plan {
    const money = Money.create(props.monthlyPrice, props.currency).orThrow();
    const planRowId = props.id
      ? UUID.create(props.id).orThrow()
      : UUID.generate();
    const now = DateTimeManager.create();
    return new Plan({
      id: planRowId.value,
      planId: props.planId,
      name: Name.create(props.name).orThrow().value,
      monthlyPrice: money.amount,
      currency: money.currency,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  public updatePrice(newPrice: number, currency?: CurrencyType): void {
    const curr = currency ?? this._monthlyMoney.currency;
    this._monthlyMoney = Money.create(newPrice, curr).orThrow();
  }

  public rename(name: string): void {
    this._name = Name.create(name).orThrow();
  }

  public activate(): void {
    this._isActive = true;
  }

  public deactivate(): void {
    this._isActive = false;
  }

  public toPersistence(): IPlan {
    return {
      id: this.id.value,
      planId: this.planId,
      name: this.name.value,
      monthlyPrice: this.monthlyPrice,
      currency: this.currency.value,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
