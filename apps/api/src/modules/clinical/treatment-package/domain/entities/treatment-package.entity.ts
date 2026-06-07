import {
  Clinic,
  PatientTreatmentPackage,
  TreatmentPackage as ITreatmentPackage,
  TreatmentPackageItem,
  TreatmentPackageProvider,
} from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { AggregateRoot } from '@common/domain/aggregate-root';

export class TreatmentPackage
  extends AggregateRoot
  implements ITreatmentPackage
{
  constructor(data: ITreatmentPackage) {
    super();
    this._id = data.id;
    this._clinicId = data.clinicId;
    this._name = data.name;
    this._examinationCount = data.examinationCount;
    this._controlCount = data.controlCount;
    this._validityDays = data.validityDays;
    this._price = data.price;
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

  private _price: Decimal;
  get price(): Decimal {
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

  private _clinic: Clinic | null;
  get clinic(): Clinic | null {
    return this._clinic;
  }

  private _items: TreatmentPackageItem[] | null;
  get items(): TreatmentPackageItem[] | null {
    return this._items;
  }

  private _providers: TreatmentPackageProvider[] | null;
  get providers(): TreatmentPackageProvider[] | null {
    return this._providers;
  }

  private _patientPackages: PatientTreatmentPackage[] | null;
  get patientPackages(): PatientTreatmentPackage[] | null {
    return this._patientPackages;
  }

  get isDeleted(): boolean {
    return !!this._deletedAt;
  }

  get totalSessionCount(): number {
    return this._examinationCount + this._controlCount;
  }

  activate(): void {
    this._isActive = true;
  }

  deactivate(): void {
    this._isActive = false;
  }

  softDelete(): void {
    this._deletedAt = new Date();
    this._isActive = false;
  }

  toPersistence(): ITreatmentPackage {
    return {
      id: this._id,
      clinicId: this._clinicId,
      name: this._name,
      examinationCount: this._examinationCount,
      controlCount: this._controlCount,
      validityDays: this._validityDays,
      price: this._price,
      isActive: this._isActive,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      deletedAt: this._deletedAt,
    };
  }
}
