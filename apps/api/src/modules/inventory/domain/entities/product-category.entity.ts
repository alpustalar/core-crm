import { ProductCategory as PrismaProductCategory } from '@prisma/client';
import { AggregateRoot } from '@common/domain/aggregate-root';

export class ProductCategory extends AggregateRoot implements PrismaProductCategory {
  constructor(data: PrismaProductCategory) {
    super();
    this._id = data.id;
    this._name = data.name;
    this._organizationId = data.organizationId;
    this._parentId = data.parentId;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
  }

  private _id: string;
  get id(): string { return this._id; }

  private _name: string;
  get name(): string { return this._name; }

  private _organizationId: string;
  get organizationId(): string { return this._organizationId; }

  private _parentId: string | null;
  get parentId(): string | null { return this._parentId; }

  private _createdAt: Date;
  get createdAt(): Date { return this._createdAt; }

  private _updatedAt: Date;
  get updatedAt(): Date { return this._updatedAt; }

  public rename(name: string): void {
    this._name = name;
  }

  toPersistence(): PrismaProductCategory {
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
