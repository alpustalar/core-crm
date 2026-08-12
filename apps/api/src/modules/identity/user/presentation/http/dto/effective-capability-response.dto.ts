import { Expose } from 'class-transformer';

/**
 * Yetki listesi yönetim ekranına gider; hassas bir alan taşımadığı için grup
 * kısıtı yoktur. Yine de DTO'dan geçer: `@Serialize` olmadan interceptor
 * fail-open çalışıp ham repository çıktısını (ileride eklenecek alanlar dahil)
 * olduğu gibi yollardı.
 */
export class EffectiveCapabilityResponseDto {
  @Expose() capability: string;
  @Expose() module: string;
  @Expose() action: string;
  /** ROLE = rolden gelir, bu ekrandan kaldırılamaz. GRANT = kişiye verilmiş. */
  @Expose() source: string;
  @Expose() grantedAt: Date | null;
  @Expose() grantedById: string | null;
  @Expose() reason: string | null;
}
