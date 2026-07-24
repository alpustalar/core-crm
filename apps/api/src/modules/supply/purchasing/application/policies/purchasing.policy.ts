import { ActorContext } from '@common/interfaces';
import { ClinicPolicy } from '@modules/organization/clinic/application/policies';
import { ExecutionSource } from '@src/domain/constants/execution-source.constant';

/**
 * Satın alma staff policy'si. Talep açma/görüntüleme aynı klinik personeline açık;
 * onay/ret + sipariş oluştur/gönder/mal-kabul/iptal klinik yöneticisi ister.
 */
export class PurchasingPolicy extends ClinicPolicy {
  constructor(actor: ActorContext, source: ExecutionSource) {
    super(actor, source);
  }

  /** Talep açma + talep/sipariş görüntüleme (aynı klinik). */
  canAccessClinicPurchasing(clinicId: string | undefined): boolean {
    return this.isSystem() || this.actorCanAccessTargetClinic(clinicId);
  }

  /** Onay/ret + sipariş yaşam döngüsü (yönetici). */
  canManageClinicPurchasing(clinicId: string | undefined | null): boolean {
    return this.isSystem() || this.actorCanManageTargetClinic(clinicId);
  }
}
