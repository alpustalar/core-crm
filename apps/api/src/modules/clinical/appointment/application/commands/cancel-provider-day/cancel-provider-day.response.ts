/**
 * Doktor-günü toplu iptal çıktısı. Bulk işlem olduğu için (domain bypass) yalnız
 * etkilenen kayıt sayısı döner — detay için Query kullanılır.
 */
export interface CancelProviderDayResponse {
  affectedCount: number;
}
