export interface CreateUserProps {
  id: string;
  email: string;
  displayName: string;
  picture?: string;
  roleId: string;
  clinicId?: string;
  providerProfile?: {
    titleId: string;
    specialtyId: string;
    isActive: boolean;
    clinicId: string;
    publicPhone?: string;
    publicEmail?: string;
  };
  ownedOrganizationIds?: string[];
  managedClinicIds?: string[];
}
