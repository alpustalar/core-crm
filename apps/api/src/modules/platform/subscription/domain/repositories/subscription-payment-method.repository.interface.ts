import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';
import { SubscriptionPaymentMethod } from '@modules/platform/subscription/domain/entities/subscription-payment-method.entity';
import {
  CreateSubscriptionPaymentMethodProps,
  SavedCardChargeModel,
} from '@modules/platform/subscription/domain/subscription.contracts';

export const SUBSCRIPTION_PAYMENT_METHOD_COMMAND_REPOSITORY = Symbol(
  'ISubscriptionPaymentMethodCommandRepository'
);
export const SUBSCRIPTION_PAYMENT_METHOD_QUERY_REPOSITORY = Symbol(
  'ISubscriptionPaymentMethodQueryRepository'
);

export interface ISubscriptionPaymentMethodCommandRepository
  extends IBaseCommandRepository<SubscriptionPaymentMethod> {
  create(entity: SubscriptionPaymentMethod): Promise<SubscriptionPaymentMethod>;
  /**
   * Abonelik-başına tek kayıtlı yöntem: varsa günceller (yeni kart), yoksa oluşturur.
   * Kart değişimi/yeniden saklama akışında callback'ten çağrılır.
   */
  upsertBySubscriptionId(
    props: CreateSubscriptionPaymentMethodProps
  ): Promise<SubscriptionPaymentMethod>;
}

export interface ISubscriptionPaymentMethodQueryRepository {
  /** Yenileme günü tahsilat için kayıtlı kart + alıcı snapshot'ı — yoksa null (kart saklanmamış). */
  findBySubscriptionId(
    subscriptionId: string
  ): Promise<SavedCardChargeModel | null>;
}
