import {
  Party as IParty,
  PartyOriginType,
  PartyRole,
  PartyType,
} from '@prisma/client';
import { AggregateRoot } from '@common/domain/aggregate-root';
import { CreatePartyProps } from '../types/create-party.props';

export class Party extends AggregateRoot implements IParty {
  constructor(data: IParty) {
    super();
    this._id = data.id;
    this._clinicId = data.clinicId;
    this._organizationId = data.organizationId;
    this._type = data.type;
    this._roles = data.roles;
    this._name = data.name;
    this._taxNumber = data.taxNumber;
    this._nationalId = data.nationalId;
    this._taxOffice = data.taxOffice;
    this._email = data.email;
    this._phone = data.phone;
    this._address = data.address;
    this._isEInvoiceUser = data.isEInvoiceUser;
    this._eInvoiceMailbox = data.eInvoiceMailbox;
    this._receivableAccountId = data.receivableAccountId;
    this._payableAccountId = data.payableAccountId;
    this._originType = data.originType;
    this._originId = data.originId;
    this._isActive = data.isActive;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
  }

  private _id: string;
  get id(): string {
    return this._id;
  }

  private _clinicId: string;
  get clinicId(): string {
    return this._clinicId;
  }

  private _organizationId: string;
  get organizationId(): string {
    return this._organizationId;
  }

  private _type: PartyType;
  get type(): PartyType {
    return this._type;
  }

  private _roles: PartyRole[];
  get roles(): PartyRole[] {
    return this._roles;
  }

  private _name: string;
  get name(): string {
    return this._name;
  }

  private _taxNumber: string | null;
  get taxNumber(): string | null {
    return this._taxNumber;
  }

  private _nationalId: string | null;
  get nationalId(): string | null {
    return this._nationalId;
  }

  private _taxOffice: string | null;
  get taxOffice(): string | null {
    return this._taxOffice;
  }

  private _email: string | null;
  get email(): string | null {
    return this._email;
  }

  private _phone: string | null;
  get phone(): string | null {
    return this._phone;
  }

  private _address: string | null;
  get address(): string | null {
    return this._address;
  }

  private _isEInvoiceUser: boolean;
  get isEInvoiceUser(): boolean {
    return this._isEInvoiceUser;
  }

  private _eInvoiceMailbox: string | null;
  get eInvoiceMailbox(): string | null {
    return this._eInvoiceMailbox;
  }

  private _receivableAccountId: string | null;
  get receivableAccountId(): string | null {
    return this._receivableAccountId;
  }

  private _payableAccountId: string | null;
  get payableAccountId(): string | null {
    return this._payableAccountId;
  }

  private _originType: PartyOriginType;
  get originType(): PartyOriginType {
    return this._originType;
  }

  private _originId: string | null;
  get originId(): string | null {
    return this._originId;
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

  public static create(props: CreatePartyProps): Party {
    return new Party({
      id: props.id ?? crypto.randomUUID(),
      clinicId: props.clinicId,
      organizationId: props.organizationId,
      type: props.type,
      roles: props.roles,
      name: props.name,
      taxNumber: props.taxNumber ?? null,
      nationalId: props.nationalId ?? null,
      taxOffice: props.taxOffice ?? null,
      email: props.email ?? null,
      phone: props.phone ?? null,
      address: props.address ?? null,
      isEInvoiceUser: props.isEInvoiceUser ?? false,
      eInvoiceMailbox: props.eInvoiceMailbox ?? null,
      receivableAccountId: props.receivableAccountId ?? null,
      payableAccountId: props.payableAccountId ?? null,
      originType: props.originType,
      originId: props.originId ?? null,
      isActive: props.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  public hasRole(role: PartyRole): boolean {
    return this._roles.includes(role);
  }

  /** Rolü ekler (idempotent). Eklendiyse true döner. */
  public addRole(role: PartyRole): boolean {
    if (this.hasRole(role)) return false;
    this._roles = [...this._roles, role];
    return true;
  }

  /** Kaynak kayıttan gelen kimlik/iletişim snapshot'ını günceller. */
  public updateSnapshot(
    snapshot: Partial<
      Pick<
        IParty,
        | 'name'
        | 'taxNumber'
        | 'nationalId'
        | 'taxOffice'
        | 'email'
        | 'phone'
        | 'address'
      >
    >
  ): void {
    if (snapshot.name !== undefined && snapshot.name !== null) {
      this._name = snapshot.name;
    }
    if (snapshot.taxNumber !== undefined) this._taxNumber = snapshot.taxNumber;
    if (snapshot.nationalId !== undefined) {
      this._nationalId = snapshot.nationalId;
    }
    if (snapshot.taxOffice !== undefined) this._taxOffice = snapshot.taxOffice;
    if (snapshot.email !== undefined) this._email = snapshot.email;
    if (snapshot.phone !== undefined) this._phone = snapshot.phone;
    if (snapshot.address !== undefined) this._address = snapshot.address;
  }

  public linkReceivableAccount(accountId: string): void {
    this._receivableAccountId = accountId;
  }

  public linkPayableAccount(accountId: string): void {
    this._payableAccountId = accountId;
  }

  public deactivate(): void {
    this._isActive = false;
  }

  public activate(): void {
    this._isActive = true;
  }

  public toPersistence(): IParty {
    return {
      id: this._id,
      clinicId: this._clinicId,
      organizationId: this._organizationId,
      type: this._type,
      roles: this._roles,
      name: this._name,
      taxNumber: this._taxNumber,
      nationalId: this._nationalId,
      taxOffice: this._taxOffice,
      email: this._email,
      phone: this._phone,
      address: this._address,
      isEInvoiceUser: this._isEInvoiceUser,
      eInvoiceMailbox: this._eInvoiceMailbox,
      receivableAccountId: this._receivableAccountId,
      payableAccountId: this._payableAccountId,
      originType: this._originType,
      originId: this._originId,
      isActive: this._isActive,
      createdAt: this._createdAt,
      updatedAt: new Date(),
    };
  }
}
