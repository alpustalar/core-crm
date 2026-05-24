export const META_ADS_EVENTS = {
  ACCOUNT_CONNECTED: 'meta-ads.account.connected',
  LEAD_RECEIVED: 'meta-ads.lead.received',
  LEAD_MATCHED: 'meta-ads.lead.matched',
} as const;

export type MetaAdsEvent =
  (typeof META_ADS_EVENTS)[keyof typeof META_ADS_EVENTS];
