/**
 * Oturum çerezinin adı. Token hem tarayıcıda (Firebase SDK belleğinde, kendini
 * yenileyerek) hem çerezde tutuluyor:
 *
 * - **Çerez** `middleware.ts`in ve sunucu bileşenlerinin okuyabildiği tek yer;
 *   middleware Firebase SDK'sını çalıştıramaz.
 * - **Bellek** ise tarayıcı isteklerinin kaynağı — orası her zaman taze.
 *
 * Çerez bu yüzden yetkinin kanıtı değil, yalnız "oturum var mı" işareti olarak
 * kullanılır; asıl doğrulama her istekte backend'de yapılır.
 */
export const SESSION_COOKIE_NAME = 'core_crm_session';

/** Firebase ID token'ı 1 saat ömürlü; çerezi ondan uzun tutmanın anlamı yok. */
export const SESSION_MAX_AGE_SECONDS = 60 * 60;
