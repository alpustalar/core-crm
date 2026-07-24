import { ActorContext } from '@common/interfaces';
import { ClinicPolicy } from '@modules/organization/clinic/application/policies';
import { ExecutionSource } from '@src/domain/constants/execution-source.constant';

/**
 * Onam formu (template + submission) staff policy'si. Template CRUD klinik yöneticisi
 * ister (hassas/legal metin); tablette imza akışını başlatma/tamamlama ve submission
 * görüntüleme aynı-klinik personeline açıktır (facilitasyon, yönetim kararı değil).
 */
export class ConsentFormPolicy extends ClinicPolicy {
  constructor(actor: ActorContext, source: ExecutionSource) {
    super(actor, source);
  }

  /** Şablon oluşturma/güncelleme/arşivleme — klinik yöneticisi. */
  canManageConsentTemplates(clinicId: string | undefined | null): boolean {
    return this.isSystem() || this.actorCanManageTargetClinic(clinicId);
  }

  /** Şablon listeleme/görüntüleme — aynı klinik personeli. */
  canAccessConsentTemplates(clinicId: string | undefined): boolean {
    return this.isSystem() || this.actorCanAccessTargetClinic(clinicId);
  }

  /** Tablet imza akışını başlatma/tamamlama — aynı klinik personeli yeterli. */
  canSignConsentForm(clinicId: string | undefined): boolean {
    return this.isSystem() || this.actorCanAccessTargetClinic(clinicId);
  }

  /** İmzalanmış onam formlarını görüntüleme — aynı klinik personeli. */
  canAccessConsentSubmissions(clinicId: string | undefined): boolean {
    return this.isSystem() || this.actorCanAccessTargetClinic(clinicId);
  }
}
