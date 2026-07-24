import { ActorContext } from '@common/interfaces';
import { ClinicPolicy } from '@modules/organization/clinic/application/policies';
import { ExecutionSource } from '@src/domain/constants/execution-source.constant';
import { SerializationOptionsResponse } from '@common/interfaces/serialization-policy.interface';
import {
  FinanceResponseGroup,
  FinanceResponseGroups,
} from '@modules/finance/shared/domain/finance.contracts';

/**
 * Finans modülleri için ortak staff policy'si (ledger, invoice, payment,
 * payroll, pos, purchase-invoice). Klinik erişim yardımcılarını ClinicPolicy'den
 * miras alır; finansal alan görünürlüğünü serileştirme gruplarıyla belirler.
 */
export class FinancePolicy extends ClinicPolicy {
  constructor(actor: ActorContext, source: ExecutionSource) {
    super(actor, source);
  }

  /**
   * Aktör bu kliniğin finansal kayıtlarını okuyabilir mi?
   */
  canAccessClinicFinances(clinicId: string | undefined): boolean {
    return this.actorCanAccessTargetClinic(clinicId);
  }

  /**
   * Aktör bu kliniğin finansal kayıtlarını yönetebilir mi? (yazma işlemleri)
   */
  canManageClinicFinances(clinicId: string | undefined | null): boolean {
    return this.actorCanManageTargetClinic(clinicId);
  }

  /**
   * Finansal cevap alanlarının hangi gruplarla serileştirileceğini belirler.
   * - INTERNAL: aynı klinik personeli (temel kayıt görünürlüğü)
   * - MANAGEMENT + FINANCIAL: kliniği yöneten aktör (tutarlar, özetler)
   * - ADMIN: sistem yöneticisi (tüm alanlar)
   */
  getSerializationOptions(payload: {
    clinicId: string;
  }): SerializationOptionsResponse<FinanceResponseGroup> {
    const isSameClinic = this.actorCanAccessTargetClinic(payload.clinicId);
    const isManager = this.actorCanManageTargetClinic(payload.clinicId);
    const isSystem = this.isSystem();

    const { ADMIN, INTERNAL, FINANCIAL, MANAGEMENT } = FinanceResponseGroups;

    const groups: FinanceResponseGroup[] = [];

    if (isSameClinic) groups.push(INTERNAL);
    if (isManager) groups.push(MANAGEMENT, FINANCIAL);
    if (isSystem) groups.push(ADMIN);

    return {
      isGroupActive: isSameClinic || isManager || isSystem,
      groups,
    };
  }
}
