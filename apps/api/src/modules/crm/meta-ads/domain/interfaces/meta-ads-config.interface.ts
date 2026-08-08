export interface IMetaAdsConfig {
  appId: string;
  appSecret: string;
  redirectUri: string;
}

export const META_ADS_CONFIG = Symbol('IMetaAdsConfig');

export interface IMetaAdsPresentationConfig {
  verifyToken: string;
  appSecret: string;
}

export const META_ADS_PRESENTATION_CONFIG = Symbol(
  'IMetaAdsPresentationConfig'
);
