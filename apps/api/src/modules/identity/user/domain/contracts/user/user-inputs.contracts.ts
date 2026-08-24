import { GlobalStatusType } from '@input-type-schemas/GlobalStatusSchema';

// ==========================================
// USER — kayıt (kaynak: register saga / CreateUserCommand.data)
// organizationId burada zorunlu (kayıt anında henüz klinik/rol kurulmamış olabilir).
// ==========================================

export interface CreateUser {
  email: string;
  displayName: string;
  password: string;
  picture?: string;
  roleId: string;
  organizationId: string;
  clinicId?: string;
  managedClinicIds?: string[];
  ownedOrganizationIds?: string[];
  firebaseUid: string;
}

// ==========================================
// USER — Entity static create() girişi (handler'da CreateUser'dan türetilir)
// ==========================================

export interface CreateUserProps {
  id: string;
  email: string;
  displayName: string;
  picture?: string;
  roleId: string;
  clinicId?: string;
  ownedOrganizationIds?: string[];
  managedClinicIds?: string[];
  providerProfileId?: string;
  phone?: string;
}

export interface UpdateDetailsProps {
  displayName?: string;
  picture?: string | null;
  phoneNumber?: string | null;
  status?: GlobalStatusType;
  roleId?: string;
  clinicId?: string | null;
}

/**
 * Kapsam devri sözleşmeleri. Profil güncellemesinden (`UpdateDetailsProps`)
 * bilerek ayrıdır: farklı iş kuralı, farklı güvenlik seviyesi, farklı denetim
 * olayı. Listeler TAM listedir — gönderilen küme yeni kapsamdır, `[]` kapsamı
 * kaldırır.
 */
export interface AssignManagedClinicsProps {
  clinicIds: string[];
  actorId: string;
}

export interface GrantOrganizationOwnershipProps {
  organizationIds: string[];
  actorId: string;
}
