export interface IMetaAdsConfig {
  appId: string;
  appSecret: string;
  redirectUri: string;
}

export const META_ADS_CONFIG = Symbol('IMetaAdsConfig');
