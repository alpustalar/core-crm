import { ActorContext } from '@common/interfaces';
import { PlanIdType as PlanId } from '@input-type-schemas/PlanIdSchema';
import { Decimal } from 'decimal.js';
import { SubscriptionBuyerInfo } from '@modules/platform/subscription/infrastructure/adapters/billing-adapter.interface';
import { CurrencyType } from '@input-type-schemas/CurrencySchema';

export interface SubscribeToPlanCommandProps {
  organizationId: string;
  /** CLINIC faturalandırma hedefinde abone olan klinik (franchise). ORGANIZATION'da yok sayılır. */
  clinicId?: string;
  planId: PlanId;
  priceAtPurchase: Decimal;
  actor: ActorContext;
  buyer?: SubscriptionBuyerInfo; // FREE_TRIAL için opsiyonel, ücretli planlar için zorunlu
  currency: CurrencyType;
  externalId?: string;
  externalPriceId?: string;
}

export class SubscribeToPlanCommand {
  organizationId: string;
  clinicId?: string;
  planId: PlanId;
  priceAtPurchase: Decimal;
  currency: CurrencyType;
  actor: ActorContext;
  buyer?: SubscriptionBuyerInfo;
  externalId?: string;
  externalPriceId?: string;

  constructor(props: SubscribeToPlanCommandProps) {
    Object.assign(this, props);
  }
}
