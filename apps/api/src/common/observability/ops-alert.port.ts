export const OPS_ALERT_PORT = Symbol('OpsAlertPort');

/** Uyarının aciliyeti — kanal/kime gideceği kararını adaptör bundan türetir. */
export type OpsAlertSeverity = 'WARNING' | 'CRITICAL';

export interface OpsAlertInput {
  /** Hangi iş akışı bozuldu (ör. 'finance.ledger.create'). Slack kanal eşlemesi buna bakar. */
  operation: string;
  severity: OpsAlertSeverity;
  /** Operatöre gösterilecek tek cümlelik özet. */
  summary: string;
  /** Yakalanan hatanın mesajı; yığın izi taşınmaz (kanal dışına sızmasın). */
  errorMessage: string | null;
  /** İlgili kayıtların kimlikleri — operatör aramayı bununla yapar. */
  context: Record<string, string | number | null>;
  clinicId: string | null;
  /** Aynı olayın tekrarlarını kanalda birleştirmek için (aynı anahtar = aynı olay). */
  dedupeKey: string | null;
  occurredAt: Date;
}

/**
 * Operasyonel uyarı kanalı (Slack / PagerDuty / e-posta).
 *
 * **Neden port:** kritik akışların çoğu hatayı yutuyor — muhasebe köprüsü, cari
 * kayıt kuyruğu, mutabakat taraması. Yutmak bilinçli (ana işlem geri alınmasın)
 * ama sessiz kalmak değil: para hareketi olup defter kaydı düşmediğinde kimsenin
 * haberi olmuyordu. Uyarı gönderimi bir dış servis (Slack) işi olduğu için domain
 * yalnız bu sözleşmeyi tanır; adaptör sonra bağlanır.
 */
export interface OpsAlertPort {
  alert(input: OpsAlertInput): Promise<void>;
}
