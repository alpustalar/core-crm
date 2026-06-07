import {
  Module as PrismaModule,
  PlanId,
  SubscriptionItem as PrismaSubscriptionItem,
} from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { AggregateRoot } from '@common/domain/aggregate-root';

export class SubscriptionItem
  extends AggregateRoot
  implements PrismaSubscriptionItem
{
  constructor(data: PrismaSubscriptionItem & { module?: PrismaModule | null }) {
    super();
    this._id = data.id;
    this._subscriptionId = data.subscriptionId;
    this._planId = data.planId;
    this._moduleId = data.moduleId;
    this._priceAtPurchase = data.priceAtPurchase;
    this._externalPriceId = data.externalPriceId;
    this._createdAt = data.createdAt;
    this._module = data.module ?? null;
  }

  private _id: string;
  get id(): string {
    return this._id;
  }

  private _subscriptionId: string;
  get subscriptionId(): string {
    return this._subscriptionId;
  }

  private _planId: PlanId | null;
  get planId(): PlanId | null {
    return this._planId;
  }

  private _moduleId: string | null;
  get moduleId(): string | null {
    return this._moduleId;
  }

  private _priceAtPurchase: Decimal;
  get priceAtPurchase(): Decimal {
    return this._priceAtPurchase;
  }

  private _externalPriceId: string | null;
  get externalPriceId(): string | null {
    return this._externalPriceId;
  }

  private _createdAt: Date;
  get createdAt(): Date {
    return this._createdAt;
  }

  private _module: PrismaModule | null;
  get module(): PrismaModule | null {
    return this._module;
  }

  get isPlan(): boolean {
    return this._planId !== null;
  }
  get isModule(): boolean {
    return this._moduleId !== null;
  }
  get isFree(): boolean {
    return this._priceAtPurchase.isZero();
  }
  get hasExternalPrice(): boolean {
    return this._externalPriceId !== null;
  }

  matchesPlan(planId: PlanId): boolean {
    return this._planId === planId;
  }

  matchesModule(moduleId: string): boolean {
    return this._moduleId === moduleId;
  }

  toPersistence(): PrismaSubscriptionItem {
    return {
      id: this._id,
      subscriptionId: this._subscriptionId,
      planId: this._planId,
      moduleId: this._moduleId,
      priceAtPurchase: this._priceAtPurchase,
      externalPriceId: this._externalPriceId,
      createdAt: this._createdAt,
    };
  }
}
