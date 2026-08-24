/** Props for creating a product category. */
export interface CreateProductCategoryProps {
  /** Optional UUID; auto-generated if omitted. */
  id?: string;
  /** Category name (required). */
  name: string;
  /** Organization ID (required). */
  organizationId: string;
  /** Clinic ID (required). */
  clinicId: string;
  /** Parent category ID for hierarchical structure. */
  parentId?: string | null;
}
