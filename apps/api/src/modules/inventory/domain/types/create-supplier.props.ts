export interface CreateSupplierProps {
  id: string;
  name: string;
  contactName?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  taxNumber?: string | null;
  taxOffice?: string | null;
  organizationId: string;
}
