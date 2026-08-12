import { Expose, Type } from 'class-transformer';
import { ConsentFormResponseGroups } from '@modules/clinical/consent-form/domain/contracts/consent-form.contracts';

const { INTERNAL, MANAGEMENT, ADMIN, DATA_OWNER } = ConsentFormResponseGroups;

const OPS_GROUPS = { groups: [INTERNAL, MANAGEMENT, ADMIN, DATA_OWNER] };
const MANAGEMENT_GROUPS = { groups: [MANAGEMENT, ADMIN] };

/**
 * Onam şablonu cevabı. Başlık/versiyon seçim listesi için tabandadır; sözleşme
 * metni ve kimin oluşturduğu/güncellediği klinik içi bilgidir.
 */
export class ConsentFormTemplateResponseDto {
  // --- Kimlik ve seçim listesi alanları ---
  @Expose() id: string;
  @Expose() clinicId: string;
  @Expose() sectorId: string | null;
  @Expose() title: string;
  @Expose() version: number;
  @Expose() isActive: boolean;

  // --- Sözleşme metni (klinik içi) ---
  @Expose(OPS_GROUPS)
  content: string;

  // --- Denetim izleri ---
  @Expose(OPS_GROUPS)
  createdByUserId: string;

  @Expose(MANAGEMENT_GROUPS)
  updatedByUserId: string | null;

  @Expose(MANAGEMENT_GROUPS)
  organizationId: string;

  @Expose(OPS_GROUPS)
  @Type(() => Date)
  createdAt: Date;

  @Expose(MANAGEMENT_GROUPS)
  @Type(() => Date)
  updatedAt: Date;
}
