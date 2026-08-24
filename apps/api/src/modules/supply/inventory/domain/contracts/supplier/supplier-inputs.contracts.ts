/** Input contracts for Supplier aggregate. */

/** Props for creating a new Supplier. */
export interface CreateSupplierProps {
  /** Optional UUID; auto-generated if omitted. */
  id?: string;
  /** Supplier name (required). */
  name: string;
  /** Contact person name. */
  contactName?: string | null;
  /** Contact phone number. */
  phone?: string | null;
  /** Contact email address. */
  email?: string | null;
  /** Physical address. */
  address?: string | null;
  /** Tax/VAT ID. */
  taxNumber?: string | null;
  /** Tax office name. */
  taxOffice?: string | null;
  /** Organization ID (required). */
  organizationId: string;
  /** Clinic ID (required). */
  clinicId: string;
}

/** Props for updating an existing Supplier. */
export interface UpdateSupplierProps {
  /** Supplier name. */
  name?: string;
  /** Contact person name. */
  contactName?: string | null;
  /** Contact phone number. */
  phone?: string | null;
  /** Contact email address. */
  email?: string | null;
  /** Physical address. */
  address?: string | null;
  /** Tax/VAT ID. */
  taxNumber?: string | null;
  /** Tax office name. */
  taxOffice?: string | null;
}
