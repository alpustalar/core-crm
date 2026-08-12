export const META_ADS_EVENTS = {
  ACCOUNT_CONNECTED: 'meta-ads.account.connected',
  ACCOUNT_DISCONNECTED: 'meta-ads.account.disconnected',
  LEAD_RECEIVED: 'meta-ads.lead.received',
  LEAD_MATCHED: 'meta-ads.lead.matched',
  ACCOUNTS_LIST: 'meta-ads.accounts.list',
  LEADS_LIST: 'meta-ads.leads.list',
  REPORT: 'meta-ads.report',
  ROI_REPORT: 'meta-ads.roi-report',
} as const;

export type MetaAdsEvent =
  (typeof META_ADS_EVENTS)[keyof typeof META_ADS_EVENTS];
