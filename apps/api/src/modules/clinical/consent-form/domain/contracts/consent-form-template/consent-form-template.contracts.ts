import { Pagination } from '@shared/common';

/**
 * title/content boş-değil kuralı burada değil; `@shared` HTTP sınırı DTO'sunda
 * (CreateConsentTemplateSchema, packages/shared/modules/consent-form/schemas/commands)
 * zaten `.min(1)` ile enforce ediliyor — domain katmanı ikinci kez doğrulamaz.
 */
export interface CreateConsentTemplateProps {
  id?: string;
  organizationId: string;
  clinicId: string;
  sectorId?: string | null;
  title: string;
  content: string;
  createdByUserId: string;
}

export interface UpdateConsentTemplateProps {
  title?: string;
  content?: string;
  sectorId?: string | null;
  updatedByUserId: string;
}

export interface FindConsentTemplatesFilter {
  clinicId: string;
  isActive?: boolean;
  sectorId?: string;
  pagination: Pagination;
}
