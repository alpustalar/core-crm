import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';
import { ProductCategory } from '@modules/supply/inventory/domain/entities/product-category.entity';

export const PRODUCT_CATEGORY_COMMAND_REPOSITORY = Symbol(
  'IProductCategoryCommandRepository'
);

export type IProductCategoryCommandRepository =
  IBaseCommandRepository<ProductCategory>;

/**
 * NOT: Query repo yok. Kategori kataloğunu listeleyen bir query handler'ı
 * bulunmuyor (ürün listesi kategoriyi kendi projeksiyonunda taşıyor); kategori
 * yalnız yazma tarafında (create/update/findById) okunuyor. Panelde kategori
 * listesi gerektiğinde `...QueryRepository` düz kayıt döndürerek eklenir.
 */
