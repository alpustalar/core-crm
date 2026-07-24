import { IGetContext } from '@common/decorators';
import { TimeZoneType } from '@input-type-schemas/TimeZoneSchema';

/**
 * AI asistanı (WhatsApp/Telegram/Instagram) üzerinden randevu alırken kullanılan giriş.
 * Firebase/portal kimliği yoktur; hasta telefon numarasıyla çözülür-veya-oluşturulur.
 */
export interface BookAppointmentByContactInput {
  clinicId: string;
  organizationId: string;
  providerId: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string | null;
  startTime: Date;
  durationMinutes?: number;
  endTime?: Date;
  treatmentId?: string | null;
  notes?: string | null;
  isConsultation?: boolean;
  timezone?: TimeZoneType;
}

/**
 * Kontak bilgisiyle (ad + telefon) randevu açar. Hasta kaydı telefondan çözülür; yoksa
 * oluşturulur. Portal handler'ından farkı: kimlik önceden çözülmüş olmak zorunda değildir
 * ve randevu kaynağı entegrasyon/AI olarak işaretlenir. Dönüş: oluşturulan randevunun id'si.
 */
export class BookAppointmentByContactCommand {
  readonly __responseType!: string;

  constructor(
    public readonly data: BookAppointmentByContactInput,
    public readonly ctx: IGetContext
  ) {}
}
