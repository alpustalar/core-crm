import {
  MetaAccountConnectedEventPayload,
  MetaLeadReceivedEventPayload,
} from '@modules/meta-ads/domain/events';

export const META_ADS_EVENT_PUBLISHER = Symbol('IMetaAdsEventPublisher');

export interface IMetaAdsEventPublisher {
  accountConnected(payload: MetaAccountConnectedEventPayload): void;
  leadReceived(payload: MetaLeadReceivedEventPayload): void;
}
