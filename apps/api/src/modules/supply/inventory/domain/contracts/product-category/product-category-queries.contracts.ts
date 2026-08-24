import { ProductCategory, Pagination } from '@shared';

/** Filter for finding product categories. */
export interface FindCategoryFilter {
  organizationId: string;
  clinicId?: string;
  parentId?: string | null;
}

/** Product category read-model for query responses. */
export type ProductCategoryResponse = ProductCategory;

/** Paginated category results. */
export interface CategoryPage {
  items: ProductCategoryResponse[];
  total: number;
  pagination: Pagination;
}

/** Category hierarchy with nested children. */
export interface CategoryHierarchy extends ProductCategoryResponse {
  children: CategoryHierarchy[];
}
