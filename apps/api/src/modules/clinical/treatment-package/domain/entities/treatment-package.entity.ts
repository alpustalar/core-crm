import {
  TreatmentPackage as ITreatmentPackage,
  TreatmentPackageItem,
  TreatmentPackageProvider,
} from '@shared';
import { randomUUID } from 'crypto';
import { AggregateRoot } from '@common/domain/aggregate-root';

import {
  TreatmentPackageCreatedEvent,
  TreatmentPackageDeletedEvent,
  TreatmentPackageUpdatedEvent,
} from '@modules/clinical/treatment-package/domain/events';
import { Money } from '@src/domain/value-objects/money.vo';
import {
  CreateTreatmentPackageProps,
  TreatmentPackageItemProps,
  UpdateTreatmentPackageProps,
} from '@modules/clinical/treatment-package/domain/treatment-package.contracts';

export class TreatmentPackage extends AggregateRoot {
  constructor(
    data: ITreatmentPackage & {
      providers?: TreatmentPackageProvider[];
      items?: TreatmentPackageItem[];
    }
  ) {
    super();
    this._id = data.id;
    this._clinicId = data.clinicId;
    this._name = data.name;
    this._examinationCount = data.examinationCount;
    this._controlCount = data.controlCount;
    this._validityDays = data.validityDays;
    this._price = Money.create(data.price, data.currency);
    this._isActive = data.isActive;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
    this._deletedAt = data.deletedAt;
  }

  private _id: string;
  get id(): string {
    return this._id;
  }

  private _clinicId: string;
  get clinicId(): string {
    return this._clinicId;
  }

  private _name: string;
  get name(): string {
    return this._name;
  }

  private _examinationCount: number;
  get examinationCount(): number {
    return this._examinationCount;
  }

  private _controlCount: number;
  get controlCount(): number {
    return this._controlCount;
  }

  private _validityDays: number;
  get validityDays(): number {
    return this._validityDays;
  }

  private _price: Money;
  get price(): Money {
    return this._price;
  }

  private _isActive: boolean;
  get isActive(): boolean {
    return this._isActive;
  }

  private _createdAt: Date;
  get createdAt(): Date {
    return this._createdAt;
  }

  private _updatedAt: Date;
  get updatedAt(): Date {
    return this._updatedAt;
  }

  private _deletedAt: Date | null;
  get deletedAt(): Date | null {
    return this._deletedAt;
  }

  /**
   * Repository save() tarafından senkronlanacak ilişki yazma niyeti.
   * `undefined` → ilişkilere dokunma; dizi → mevcut ilişkileri bu set ile değiştir.
   * Prisma scalar modeline ait olmadıkları için toPersistence() dışında tutulur.
   */
  private _providerIdsToSync?: string[];
  get providerIdsToSync(): string[] | undefined {
    return this._providerIdsToSync;
  }

  private _itemsToSync?: TreatmentPackageItemProps[];
  get itemsToSync(): TreatmentPackageItemProps[] | undefined {
    return this._itemsToSync;
  }

  get isDeleted(): boolean {
    return !!this._deletedAt;
  }

  get totalSessionCount(): number {
    return this._examinationCount + this._controlCount;
  }

  /**
   * Domain kurallarına uygun yeni bir Tedavi Paketi (Aggregate) oluşturur.
   */
  public static create(props: CreateTreatmentPackageProps): TreatmentPackage {
    if (!props.name || props.name.trim().length === 0) {
      throw new Error('Tedavi paketi ismi boş olamaz.');
    }
    props.price.validateGreaterThanZeroOrThrow(
      'Tedavi paket fiyatı negatif olamaz'
    );

    const now = new Date();

    const entity = new TreatmentPackage({
      id: randomUUID(),
      clinicId: props.clinicId,
      name: props.name.trim(),
      examinationCount: props.examinationCount,
      controlCount: props.controlCount,
      validityDays: props.validityDays,
      price: props.price.amount,
      currency: props.price.currency,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    });

    entity._providerIdsToSync = props.providerIds ?? [];
    entity._itemsToSync = props.items ?? [];

    entity.addDomainEvent(
      new TreatmentPackageCreatedEvent({
        packageId: entity._id,
        clinicId: entity._clinicId,
        name: entity._name,
      })
    );

    return entity;
  }

  public update(props: UpdateTreatmentPackageProps): void {
    if (this._deletedAt) {
      throw new Error('Silinmiş tedavi paketi güncellenemez.');
    }

    if (props.name !== undefined) {
      if (props.name.trim().length === 0) {
        throw new Error('Tedavi paketi ismi boş olamaz.');
      }
      this._name = props.name.trim();
    }
    if (props.examinationCount !== undefined)
      this._examinationCount = props.examinationCount;
    if (props.controlCount !== undefined)
      this._controlCount = props.controlCount;
    if (props.validityDays !== undefined)
      this._validityDays = props.validityDays;
    if (props.price !== undefined) {
      props.price.validateGreaterThanZeroOrThrow(
        'Tedavi paket fiyatı negatif olamaz'
      );
      this._price = props.price;
    }
    if (props.isActive !== undefined) this._isActive = props.isActive;
    if (props.providerIds !== undefined)
      this._providerIdsToSync = props.providerIds;
    if (props.items !== undefined) this._itemsToSync = props.items;

    this._updatedAt = new Date();

    this.addDomainEvent(
      new TreatmentPackageUpdatedEvent({
        packageId: this._id,
        clinicId: this._clinicId,
      })
    );
  }

  public activate(): void {
    this._isActive = true;
  }

  public deactivate(): void {
    this._isActive = false;
  }

  public softDelete(): void {
    if (this._deletedAt) return;

    this._deletedAt = new Date();
    this._isActive = false;
    this._updatedAt = new Date();

    this.addDomainEvent(
      new TreatmentPackageDeletedEvent({
        packageId: this._id,
        clinicId: this._clinicId,
      })
    );
  }

  toPersistence(): ITreatmentPackage {
    return {
      id: this._id,
      clinicId: this._clinicId,
      name: this._name,
      examinationCount: this._examinationCount,
      controlCount: this._controlCount,
      validityDays: this._validityDays,
      price: this._price.amount,
      currency: this._price.currency,
      isActive: this._isActive,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      deletedAt: this._deletedAt,
    };
  }
}
