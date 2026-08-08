import { ActorContext } from '@common/interfaces';
import { ClinicPolicy } from '@modules/organization/clinic/application/policies';
import { ExecutionSource } from '@src/domain/constants/execution-source.constant';

/**
 * Proje yönetimi staff policy'si.
 *
 * Üç kademe: (1) görüntüleme ve kendi görevini ilerletme aynı klinik personeline
 * açıktır, (2) proje/aşama/görev tanımlama ve kaynak tahsisi klinik yöneticisi
 * ister, (3) bütçe ve maliyet ayrıca finans yetkisi ister — proje harcaması
 * ticari bir veridir ve panoyu gören herkes görmemelidir.
 */
export class ProjectPolicy extends ClinicPolicy {
  constructor(actor: ActorContext, source: ExecutionSource) {
    super(actor, source);
  }

  /** Proje/pano görüntüleme + kendi görevini ilerletme (aynı klinik personeli). */
  canAccessClinicProjects(clinicId: string | undefined | null): boolean {
    return (
      this.isSystem() || this.actorCanAccessTargetClinic(clinicId ?? undefined)
    );
  }

  /** Proje/aşama/görev tanımlama, durum değiştirme, kaynak tahsisi (yönetici). */
  canManageClinicProjects(clinicId: string | undefined | null): boolean {
    return this.isSystem() || this.actorCanManageTargetClinic(clinicId);
  }

  /**
   * Bütçe belirleme, maliyet kaydı ve bütçe-vs-fiili raporu.
   * Yönetici yetkisiyle aynı kapıdan geçer; ayrı metot olması niyeti belgeler ve
   * ileride finans-özel bir yetkiye bağlanmasını tek noktadan mümkün kılar.
   */
  canManageProjectFinancials(clinicId: string | undefined | null): boolean {
    return this.isSystem() || this.actorCanManageTargetClinic(clinicId);
  }
}
