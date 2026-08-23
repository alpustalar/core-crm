import { ActorContext } from '@common/interfaces';
import { ConversationAccessDeniedException } from '@modules/conversation/domain/exceptions/conversation.exceptions';

/** `Priority.isAdmin` ile aynı eşik: 100 ve üstü her kontrolü atlar. */
const ADMIN_PRIORITY = 100;

/**
 * Aktör hedef kliniğin verisine erişebilir mi?
 *
 * Semantik `apps/api`'deki `ClinicPolicy.actorCanAccessTargetClinic` ile birebir:
 * yönettiği klinikler (`managedClinics`) **veya** kendi kliniği. messaging ayrı bir
 * servis ve policy altyapısı orada yok; kural bu yüzden burada, tek yerde, elle
 * yazılı — kopyası dağılmasın diye tüm conversation handler'ları bunu çağırır.
 *
 * **Neden gerekli:** handler'lar `clinicId`'yi URL'den alıp doğrudan sorguya
 * geçiriyordu. Var olan kontroller (`conversation.clinicId !== payload.clinicId`)
 * kaydı **URL parametresiyle** karşılaştırıyor, aktörle değil — yani başka bir
 * kliniğin id'sini yazan herhangi bir oturum açmış kullanıcı o kliniğin tüm
 * yazışmalarını (kişi adı, telefon, mesaj gövdesi) okuyabiliyordu.
 */
export function assertActorCanAccessClinic(
  actor: ActorContext,
  clinicId: string
): void {
  if (actor.rolePriority >= ADMIN_PRIORITY) return;

  const managesClinic = actor.managedClinics?.some(
    (clinic) => clinic.id === clinicId
  );
  if (managesClinic) return;

  if (actor.clinicId && actor.clinicId === clinicId) return;

  throw new ConversationAccessDeniedException(clinicId);
}
