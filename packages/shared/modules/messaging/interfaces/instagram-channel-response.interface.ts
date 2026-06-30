/**
 * Klinik Instagram kanal config'inin maskeli (public) görünümü. Gerçek erişim token'ı
 * ASLA sızdırılmaz; yalnızca yapılandırılmış olup olmadığı (hasAccessToken) bilinir.
 */
export interface InstagramChannelResponse {
  id: string;
  clinicId: string;
  igUserId: string;
  pageId: string | null;
  username: string | null;
  hasAccessToken: boolean;
  isActive: boolean;
  lastError: string | null;
  createdAt: Date;
  updatedAt: Date;
}
