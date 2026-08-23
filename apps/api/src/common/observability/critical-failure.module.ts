import { Global, Module } from '@nestjs/common';
import { CriticalFailurePublisher } from './critical-failure.publisher';

/**
 * Kritik hata yayıncısını **global** sağlar.
 *
 * Yayıncıya ihtiyaç duyan yerler modül grafiğinin her tarafına dağılmış durumda
 * (muhasebe köprüleri, cari kuyruğu, POS mutabakatı, e-belge işçisi). Her birinin
 * bildirim modülünü import etmesi, bildirim modülünün controller'larını ve
 * dinleyicilerini de o grafiklere çekerdi — `PolicyModule` ile aynı gerekçe.
 *
 * Dinleyici ve teslim adaptörü burada DEĞİL, `NotificationEventModule`'da durur:
 * yayınlamak ile göndermek ayrı sorumluluklar; uyarı kanalı olmayan bir serviste
 * (ör. test) yalnız yayıncı ayakta kalır.
 */
@Global()
@Module({
  providers: [CriticalFailurePublisher],
  exports: [CriticalFailurePublisher],
})
export class CriticalFailureModule {}
