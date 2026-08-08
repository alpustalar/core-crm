export const META_ADS_CACHE_SERVICE = Symbol('IMetaAdsCacheService');

export interface IMetaAdsCacheService {
  metaOAuthState: {
    set(state: string, payload: string): Promise<void>;
    get(state: string): Promise<string | null>;
    delete(state: string): Promise<void>;
  };
}
