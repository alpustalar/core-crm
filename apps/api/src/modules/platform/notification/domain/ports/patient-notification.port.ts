export const PATIENT_NOTIFICATION_PORT = Symbol('PatientNotificationPort');

export type PatientNotificationKind =
  | 'BOOKING_RECEIVED'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'RESCHEDULED'
  | 'REMINDER';

export interface PatientNotificationInput {
  kind: PatientNotificationKind;
  patientName: string;
  patientEmail: string | null;
  patientPhone: string | null;
  clinicId: string;
  /** İlgili randevu zamanı (RESCHEDULED'da yeni zaman). */
  startTime: Date;
  /** CANCELLED için opsiyonel iptal gerekçesi. */
  reason?: string;
  /**
   * REMINDER'da iki yönlü onay bekleniyor mu? true ise WhatsApp template
   * quick-reply butonları (Onayla/İptal) ile gönderilmelidir (iki yönlü SEAM).
   */
  requireResponse?: boolean;
}

/**
 * Hastaya dış kanaldan (WhatsApp template / e-posta) bildirim gönderen port.
 * Notification dispatcher bu port üzerinden konuşur; kanal seçimi + metin adaptörde.
 */
export interface PatientNotificationPort {
  notify(input: PatientNotificationInput): Promise<void>;
}
