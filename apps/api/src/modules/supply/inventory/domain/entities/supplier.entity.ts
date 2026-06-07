import { Supplier as PrismaSupplier } from '@prisma/client';
import { AggregateRoot } from '@common/domain/aggregate-root';

export class Supplier extends AggregateRoot implements PrismaSupplier {
  constructor(data: PrismaSupplier) {
    super();
    this._id = data.id;
    this._name = data.name;
    this._contactName = data.contactName;
    this._phone = data.phone;
    this._email = data.email;
    this._address = data.address;
    this._taxNumber = data.taxNumber;
    this._taxOffice = data.taxOffice;
    this._organizationId = data.organizationId;
    this._isActive = data.isActive;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
  }

  private _id: string;
  get id(): string { return this._id; }

  private _name: string;
  get name(): string { return this._name; }

  private _contactName: string | null;
  get contactName(): string | null { return this._contactName; }

  private _phone: string | null;
  get phone(): string | null { return this._phone; }

  private _email: string | null;
  get email(): string | null { return this._email; }

  private _address: string | null;
  get address(): string | null { return this._address; }

  private _taxNumber: string | null;
  get taxNumber(): string | null { return this._taxNumber; }

  private _taxOffice: string | null;
  get taxOffice(): string | null { return this._taxOffice; }

  private _organizationId: string;
  get organizationId(): string { return this._organizationId; }

  private _isActive: boolean;
  get isActive(): boolean { return this._isActive; }

  private _createdAt: Date;
  get createdAt(): Date { return this._createdAt; }

  private _updatedAt: Date;
  get updatedAt(): Date { return this._updatedAt; }

  public update(props: Partial<{
    name: string;
    contactName: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    taxNumber: string | null;
    taxOffice: string | null;
  }>): void {
    if (props.name !== undefined) this._name = props.name;
    if (props.contactName !== undefined) this._contactName = props.contactName;
    if (props.phone !== undefined) this._phone = props.phone;
    if (props.email !== undefined) this._email = props.email;
    if (props.address !== undefined) this._address = props.address;
    if (props.taxNumber !== undefined) this._taxNumber = props.taxNumber;
    if (props.taxOffice !== undefined) this._taxOffice = props.taxOffice;
  }

  public activate(): void {
    this._isActive = true;
  }

  public deactivate(): void {
    this._isActive = false;
  }

  toPersistence(): PrismaSupplier {
    return {
      id: this._id,
      name: this._name,
      contactName: this._contactName,
      phone: this._phone,
      email: this._email,
      address: this._address,
      taxNumber: this._taxNumber,
      taxOffice: this._taxOffice,
      organizationId: this._organizationId,
      isActive: this._isActive,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
