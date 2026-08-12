import { MetaLeadReceivedEventPayload } from '@modules/crm/meta-ads/domain/events';

export const META_ADS_EVENT_PUBLISHER = Symbol('IMetaAdsEventPublisher');

/**
 * Hesap bağlama/kesme event'leri entity içinde raise edilir (MetaAdAccount);
 * publisher yalnız entity'si olmayan dış-kaynaklı olayları (webhook lead'i) taşır.
 */
export interface IMetaAdsEventPublisher {
  leadReceived(payload: MetaLeadReceivedEventPayload): void;
}
