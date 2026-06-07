export interface CreateUserProps {
  id: string;
  email: string;
  displayName: string;
  picture?: string;
  roleId: string;
  clinicId?: string;
  ownedOrganizationIds?: string[];
  managedClinicIds?: string[];
}
