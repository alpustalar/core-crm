import type { Clinic, Role, User as IUser } from '@shared';
import { GlobalStatusType } from '@input-type-schemas/GlobalStatusSchema';
import { AggregateRoot } from '@common/domain/aggregate-root';
import { UpdateDetailsProps } from '@modules/user/domain/types/update-details.props';

export type UserWithRelations = IUser & {
  role: Role | null;
  workingClinic: Clinic | null;
  managedClinicIds: string[];
  ownedOrganizationIds: string[];
  providerProfileId: string | null;
};

export class User extends AggregateRoot implements IUser {
  constructor(data: UserWithRelations) {
    super();
    this._id = data.id;
    this._displayName = data.displayName;
    this._email = data.email;
    this._emailVerified = data.emailVerified;
    this._status = data.status;
    this._roleId = data.roleId ?? null;
    this._picture = data.picture ?? null;
    this._clinicId = data.clinicId ?? null;
    this._lastLogin = data.lastLogin;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
    this._deletedAt = data.deletedAt ?? null;
    this._phoneNumber = data.phoneNumber ?? null;
    this._role = data.role ?? null;
    this._workingClinic = data.workingClinic ?? null;
    this._managedClinicIds = data.managedClinicIds ?? [];
    this._ownedOrganizationIds = data.ownedOrganizationIds ?? [];
    this._providerProfileId = data.providerProfileId ?? null;
  }

  private _ownedOrganizationIds: string[] | null;

  get ownedOrganizationIds(): string[] | null {
    return this._ownedOrganizationIds;
  }

  private _providerProfileId: string | null;

  get providerProfileId(): string | null {
    return this._providerProfileId;
  }

  private _managedClinicIds: string[] | null;

  get managedClinicIds(): string[] | null {
    return this._managedClinicIds;
  }

  private _id: string;

  get id(): string {
    return this._id;
  }

  private _displayName: string;

  get displayName(): string {
    return this._displayName;
  }

  private _email: string;

  get email(): string {
    return this._email;
  }

  private _emailVerified: boolean;

  get emailVerified(): boolean {
    return this._emailVerified;
  }

  private _status: GlobalStatusType;

  get status(): GlobalStatusType {
    return this._status;
  }

  private _roleId: string | null;

  get roleId(): string | null {
    return this._roleId;
  }

  private _picture: string | null;

  get picture(): string | null {
    return this._picture;
  }

  private _phoneNumber: string | null;

  get phoneNumber(): string | null {
    return this._phoneNumber;
  }

  private _clinicId: string | null;

  get clinicId(): string | null {
    return this._clinicId;
  }

  private _lastLogin: Date;

  get lastLogin(): Date {
    return this._lastLogin;
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

  private _role: Role | null;

  get role(): Role | null {
    return this._role;
  }

  private _workingClinic: Clinic | null;

  get workingClinic(): Clinic | null {
    return this._workingClinic;
  }

  // Domain query methods

  get isDeleted(): boolean {
    return !!this._deletedAt;
  }

  get isActive(): boolean {
    return this._status === 'ACTIVE' && !this.isDeleted;
  }

  isManagerOf(clinicId: string): boolean {
    return this._managedClinicIds?.includes(clinicId) ?? false;
  }

  updateDetails(props: UpdateDetailsProps): void {
    if (this.isDeleted) {
      throw new Error('Silinmiş bir kullanıcı güncellenemez.');
    }

    if (props.displayName !== undefined) this._displayName = props.displayName;
    if (props.picture !== undefined) this._picture = props.picture;
    if (props.phoneNumber !== undefined) this._phoneNumber = props.phoneNumber;
    if (props.status !== undefined) this._status = props.status;
    if (props.roleId !== undefined) this._roleId = props.roleId;
    if (props.clinicId !== undefined) this._clinicId = props.clinicId;
  }

  changeStatus(status: GlobalStatusType): void {
    this._status = status;
  }

  canSoftDelete(): boolean {
    return !(this.role && this.role.priority >= 100);
  }

  softDelete(): void {
    if (!this.canSoftDelete()) {
      throw new Error('Sistem yöneticisi (Admin) hesabı silinemez.');
    }

    if (this.isDeleted) {
      return;
    }

    this._deletedAt = new Date();
    this._status = 'DELETED';
  }

  toPersistence(): IUser {
    return {
      id: this._id,
      displayName: this._displayName,
      email: this._email,
      emailVerified: this._emailVerified,
      status: this._status,
      roleId: this._roleId,
      picture: this._picture,
      phoneNumber: this._phoneNumber,
      clinicId: this._clinicId,
      lastLogin: this._lastLogin,
      createdAt: this._createdAt,
      updatedAt: new Date(),
      deletedAt: this._deletedAt,
    };
  }
}
