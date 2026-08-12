import { Expose, Type } from 'class-transformer';
import { ConsentFormResponseGroups } from '@modules/clinical/consent-form/domain/contracts/consent-form.contracts';

const { INTERNAL, MANAGEMENT } = ConsentFormResponseGroups;

/**
 * İmzalanmış onam formu detayı. Hangi onamın ne zaman alındığı klinik personeline
 * açık; imza görseli ve o anki sözleşme metni snapshot'ı yönetime kapalıdır —
 * ikisi birlikte hukuki delil paketini oluşturur.
 */
export class ConsentFormSubmissionResponseDto {
  // --- Kimlik ---
  @Expose() id: string;
  @Expose() patientId: string;
  @Expose() templateId: string;
  @Expose() templateVersion: number;
  @Expose() templateTitleSnapshot: string;

  @Expose()
  @Type(() => Date)
  signedAt: Date;

  // --- Bağlam (klinik içi) ---
  @Expose({ groups: [INTERNAL, MANAGEMENT] })
  clinicId: string;

  @Expose({ groups: [INTERNAL, MANAGEMENT] })
  appointmentId: string | null;

  @Expose({ groups: [INTERNAL, MANAGEMENT] })
  treatmentId: string | null;

  @Expose({ groups: [INTERNAL, MANAGEMENT] })
  signedByUserId: string;

  @Expose({ groups: [INTERNAL, MANAGEMENT] })
  @Type(() => Date)
  createdAt: Date;

  // --- Hukuki delil paketi (yönetim) ---
  @Expose({ groups: [MANAGEMENT] })
  signatureImage: string;

  @Expose({ groups: [MANAGEMENT] })
  templateContentSnapshot: string;

  @Expose({ groups: [MANAGEMENT] })
  organizationId: string;
}

/**
 * Hasta onam listesi satırı (ConsentFormSubmissionListItem read-model).
 * Liste imza görseli taşımaz — detay endpoint'inden çözülür.
 */
export class ConsentFormSubmissionListItemResponseDto {
  @Expose() id: string;
  @Expose() templateId: string;
  @Expose() templateTitleSnapshot: string;
  @Expose() templateVersion: number;

  @Expose()
  @Type(() => Date)
  signedAt: Date;

  @Expose({ groups: [INTERNAL, MANAGEMENT] })
  signedByUserId: string;

  @Expose({ groups: [INTERNAL, MANAGEMENT] })
  appointmentId: string | null;

  @Expose({ groups: [INTERNAL, MANAGEMENT] })
  treatmentId: string | null;
}
