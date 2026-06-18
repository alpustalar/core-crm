import { ProductCategory as IProductCategory } from '@shared';
import { AggregateRoot } from '@common/domain/aggregate-root';
import { randomUUID } from 'crypto';
import { CreateProductCategoryProps } from '@modules/supply/inventory/domain/types/create-product-category.props';

export class ProductCategory extends AggregateRoot {
  private constructor(data: IProductCategory) {
    super();
    this._id = data.id;
    this._name = data.name;
    this._organizationId = data.organizationId;
    this._parentId = data.parentId;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
  }

  private _id: string;
  get id(): string {
    return this._id;
  }

  private _name: string;
  get name(): string {
    return this._name;
  }

  private _organizationId: string;
  get organizationId(): string {
    return this._organizationId;
  }

  private _parentId: string | null;
  get parentId(): string | null {
    return this._parentId;
  }

  private _createdAt: Date;
  get createdAt(): Date {
    return this._createdAt;
  }

  private _updatedAt: Date;
  get updatedAt(): Date {
    return this._updatedAt;
  }

  /**
   * Domain kurallarına uygun olarak yeni bir Ürün Kategorisi (Aggregate) oluşturur.
   */
  public static create(props: CreateProductCategoryProps): ProductCategory {
    if (!props.name || props.name.trim().length === 0) {
      throw new Error('Kategori ismi boş olamaz.');
    }

    // (self-referencing loop)
    const id = randomUUID();
    if (props.parentId && props.parentId === id) {
      throw new Error('Kategori kendisinin üst kategorisi olamaz.');
    }

    const now = new Date();

    return new ProductCategory({
      id,
      name: props.name.trim(),
      organizationId: props.organizationId,
      parentId: props.parentId ?? null,
      createdAt: now,
      updatedAt: now,
    });
  }

  /**
   * Veritabanından (Prisma) dönen ham veriyi domain nesnesine güvenle eşler.
   */

  public rename(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Kategori ismi boş olamaz.');
    }
    this._name = name.trim();
    this._updatedAt = new Date();
  }

  toPersistence(): IProductCategory {
    return {
      id: this._id,
      name: this._name,
      organizationId: this._organizationId,
      parentId: this._parentId,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
