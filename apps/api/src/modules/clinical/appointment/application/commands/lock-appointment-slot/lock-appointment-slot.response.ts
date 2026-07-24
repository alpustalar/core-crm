/**
 * Slot geçici kilit çıktısı. Kilit Redis'te tutulur; frontend randevu oluşturma
 * akışını lockedUntil'e kadar tamamlamalı, sonra release etmeli (ya da TTL dolar).
 */
export interface LockAppointmentSlotResponse {
  lockedUntil: Date;
  ttlSeconds: number;
}
