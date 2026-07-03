import {
  TreatmentPackage as ITreatmentPackage,
  TreatmentPackageItem,
  TreatmentPackageProvider,
} from '@shared';
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
} from '@modules/clinical/treatment-package/domain/contracts/treatment-package.contracts';
import { TreatmentPackageAlreadyDeletedException } from '@modules/clinical/treatment-package/domain/exceptions/treatment-package.exceptions';
import { UUID } from '@src/domain/value-objects/uuid.vo';
import { Name } from '@src/domain/value-objects/name.vo';
import { DateTimeManager } from '@common/infrastructure/date-time/date-time.manager';
import { isNotUndefined } from '@common/utils/is-not-undefined';
import { Currency } from '@src/domain/value-objects/currency.vo';

export class TreatmentPackage extends AggregateRoot {
  constructor(
    data: ITreatmentPackage & {
      providers?: TreatmentPackageProvider[];
      items?: TreatmentPackageItem[];
    }
  ) {
    super();
    this._id = UUID.fromTrusted(data.id);
    this._clinicId = UUID.fromTrusted(data.clinicId);
    this._name = Name.fromTrusted(data.name);
    this._examinationCount = data.examinationCount;
    this._controlCount = data.controlCount;
    this._validityDays = data.validityDays;
    this._price = Money.fromTrusted(data.price, data.currency);
    this._isActive = data.isActive;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
    this._deletedAt = data.deletedAt;
  }

  private _id: UUID;
  get id(): UUID {
    return this._id;
  }

  private _clinicId: UUID;
  get clinicId(): UUID {
    return this._clinicId;
  }

  private _name: Name;
  get name(): Name {
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

  get currency(): Currency {
    return Currency.fromTrusted(this.price.currency);
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

  public static create(props: CreateTreatmentPackageProps): TreatmentPackage {
    props.price.validate.greaterThanZero.orThrow(
      'Tedavi paket fiyatı sıfırdan büyük olmak zorundadır.'
    );

    const now = new Date();
    const id = props.id
      ? UUID.create(props.id).orThrow().value
      : UUID.generate().value;

    const entity = new TreatmentPackage({
      id: id,
      clinicId: UUID.create(props.clinicId).orThrow().value,
      name: Name.create(props.name, 'Tedavi paketi adı uygun değil').orThrow()
        .value,
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
        packageId: entity._id.value,
        clinicId: entity._clinicId.value,
        name: entity._name.value,
      })
    );

    return entity;
  }

  public update(props: UpdateTreatmentPackageProps): void {
    if (this._deletedAt) {
      throw new TreatmentPackageAlreadyDeletedException();
    }

    if (isNotUndefined(props.name)) {
      this._name = Name.create(props.name).orThrow();
    }
    if (isNotUndefined(props.examinationCount))
      this._examinationCount = props.examinationCount;
    if (isNotUndefined(props.controlCount))
      this._controlCount = props.controlCount;
    if (isNotUndefined(props.validityDays))
      this._validityDays = props.validityDays;

    if (isNotUndefined(props.price)) {
      props.price.validate.greaterThanZero.orThrow(
        'Tedavi paket fiyatı negatif olamaz'
      );
      this._price = props.price;
    }
    if (isNotUndefined(props.isActive)) this._isActive = props.isActive;

    if (isNotUndefined(props.providerIds))
      this._providerIdsToSync = props.providerIds;

    if (isNotUndefined(props.items)) this._itemsToSync = props.items;

    this._updatedAt = DateTimeManager.create();

    this.addDomainEvent(
      new TreatmentPackageUpdatedEvent({
        packageId: this._id.value,
        clinicId: this._clinicId.value,
      })
    );
  }

  public activate(): void {
    this._isActive = true;
  }

  public deactivate(): void {
    this._isActive = false;
  }

  public switchActiveStatus(): void {
    this._isActive = !this._isActive;
  }

  public softDelete(): void {
    if (this._deletedAt) return;

    const now = DateTimeManager.create();
    this._deletedAt = now;
    this._updatedAt = now;

    this.deactivate();

    this.addDomainEvent(
      new TreatmentPackageDeletedEvent({
        packageId: this._id.value,
        clinicId: this._clinicId.value,
      })
    );
  }

  toPersistence(): ITreatmentPackage {
    return {
      id: this._id.value,
      clinicId: this._clinicId.value,
      name: this._name.value,
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
