import { ActorContext } from '@common/interfaces';
import { ClinicPolicy } from '@modules/organization/clinic/application/policies';
import { ExecutionSource } from '@src/domain/constants/execution-source.constant';

/**
 * Dış iş emri staff policy'si. İş emri açma, görüntüleme ve tedarikçideki ilerlemeyi
 * işaretleme aynı klinik personeline açıktır (günlük operasyon); iptal, teslim alma
 * (maliyet kesinleşmesi) ve yeniden yapım açma klinik yöneticisi ister.
 */
export class WorkOrderPolicy extends ClinicPolicy {
  constructor(actor: ActorContext, source: ExecutionSource) {
    super(actor, source);
  }

  /** İş emri açma + görüntüleme + ara ilerleme (aynı klinik). */
  canAccessClinicWorkOrders(clinicId: string | undefined): boolean {
    return this.isSystem() || this.actorCanAccessTargetClinic(clinicId);
  }

  /** Teslim alma, iptal, yeniden yapım — maliyet etkisi olan adımlar (yönetici). */
  canManageClinicWorkOrders(clinicId: string | undefined | null): boolean {
    return this.isSystem() || this.actorCanManageTargetClinic(clinicId);
  }
}
