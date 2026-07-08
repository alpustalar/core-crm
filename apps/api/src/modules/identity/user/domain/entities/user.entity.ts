import type { User as IUser } from '@shared';
import {
  GlobalStatusSchema,
  GlobalStatusType,
} from '@input-type-schemas/GlobalStatusSchema';
import { AggregateRoot } from '@common/domain/aggregate-root';
import { UpdateUserByStaffEvent } from '@modules/identity/user/domain/events/update-user-by-staff.event';
import { LogAction, LogType } from '@src/domain/constants/log-action.constant';
import {
  CreateUserProps,
  UpdateDetailsProps,
} from '@modules/identity/user/domain/user.contracts';
import {
  InvalidUserDeletionException,
  InvalidUserUpdateException,
} from '@modules/identity/user/domain/exceptions/user.exceptions';
import { DateTimeManager } from '@common/infrastructure/date-time/date-time.manager';
import { FirebaseUid } from '@src/domain/value-objects/firebase-uid.vo';
import { Email } from '@src/domain/value-objects/email.vo';
import { UUID } from '@src/domain/value-objects/uuid.vo';
import { Img } from '@src/domain/value-objects/img.vo';
import { Phone } from '@src/domain/value-objects/phone.vo';
import { Guard } from '@common/domain/guards';

export type UserRoleRef = { id: string; priority: number };
export type UserWorkingClinicRef = { id: string };

export type UserWithRelations = IUser & {
  role: UserRoleRef | null;
  workingClinic: UserWorkingClinicRef | null;
  managedClinicIds: string[];
  ownedOrganizationIds: string[];
  providerProfileId: string | null;
};

export class User extends AggregateRoot {
  constructor(data: UserWithRelations) {
    super();
    this._id = FirebaseUid.fromTrusted(data.id);
    this._displayName = data.displayName;
    this._email = Email.fromTrusted(data.email);
    this._emailVerified = data.emailVerified;
    this._status = data.status;
    this._roleId = UUID.fromTrusted(data.roleId);
    this._picture = Img.fromTrusted(data.picture) ?? null;
    this._clinicId = data.clinicId ? UUID.fromTrusted(data.clinicId) : null;
    this._lastLogin = data.lastLogin;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
    this._deletedAt = data.deletedAt ?? null;
    this._phoneNumber = data.phoneNumber
      ? Phone.fromTrusted(data.phoneNumber)
      : null;
    this._role = data.role ?? null;
    this._workingClinic = data.workingClinic ?? null;

    this._managedClinicIds = data.managedClinicIds
      ? data.managedClinicIds.map((ids) => UUID.fromTrusted(ids))
      : [];

    this._ownedOrganizationIds = data.ownedOrganizationIds
      ? data.ownedOrganizationIds.map((ids) => UUID.fromTrusted(ids))
      : [];

    this._providerProfileId = data.providerProfileId
      ? UUID.fromTrusted(data.providerProfileId)
      : null;
  }

  private _ownedOrganizationIds: UUID[] | null;

  get ownedOrganizationIds(): UUID[] | null {
    return this._ownedOrganizationIds;
  }

  private _providerProfileId: UUID | null;

  get providerProfileId(): UUID | null {
    return this._providerProfileId;
  }

  private _managedClinicIds: UUID[] | null;

  get managedClinicIds(): UUID[] | null {
    return this._managedClinicIds;
  }

  private _id: FirebaseUid;

  get id(): FirebaseUid {
    return this._id;
  }

  private _displayName: string;

  get displayName(): string {
    return this._displayName;
  }

  private _email: Email;

  get email(): Email {
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

  private _roleId: UUID;

  get roleId(): UUID {
    return this._roleId;
  }

  private _picture: Img | null;

  get picture(): Img | null {
    return this._picture;
  }

  private _phoneNumber: Phone | null;

  get phoneNumber(): Phone | null {
    return this._phoneNumber;
  }

  private _clinicId: UUID | null;

  get clinicId(): UUID | null {
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

  private _role: UserRoleRef | null;

  get role(): UserRoleRef | null {
    return this._role;
  }

  private _workingClinic: UserWorkingClinicRef | null;

  get workingClinic(): UserWorkingClinicRef | null {
    return this._workingClinic;
  }

  get isDeleted(): boolean {
    return !!this._deletedAt;
  }

  // Domain query methods

  get isActive(): Guard<boolean> {
    const isValid =
      this._status === GlobalStatusSchema.enum.ACTIVE && !this.isDeleted;
    return Guard.monitor(
      isValid,
      isValid,
      () => new Error('Kullanıcı aktif değil')
    );
  }

  static create(props: CreateUserProps): User {
    const now = DateTimeManager.create();
    return new User({
      id: FirebaseUid.create(props.id).orThrow().value,
      email: Email.create(props.email).orThrow().value,
      displayName: props.displayName,
      emailVerified: false,
      status: GlobalStatusSchema.enum.ACTIVE,
      roleId: UUID.create(props.roleId).orThrow().value,
      picture: props.picture ? Img.create(props.picture).orThrow().value : null,
      phoneNumber: props.phone
        ? Phone.create(props.phone).orThrow().value
        : null,
      clinicId: props.clinicId
        ? UUID.create(props.clinicId).orThrow().value
        : null,
      lastLogin: now,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      role: null,
      workingClinic: null,

      managedClinicIds: props.managedClinicIds
        ? props.managedClinicIds.map((ids) => UUID.create(ids).orThrow().value)
        : [],

      ownedOrganizationIds: props.ownedOrganizationIds
        ? props.ownedOrganizationIds.map(
            (ids) => UUID.create(ids).orThrow().value
          )
        : [],

      providerProfileId: props.providerProfileId
        ? UUID.create(props.providerProfileId).orThrow().value
        : null,
    });
  }

  isManagerOf(clinicId: string): boolean {
    return (
      this._managedClinicIds?.some(({ value: id }) => id === clinicId) ?? false
    );
  }

  updateDetails(props: UpdateDetailsProps, actorId: string): void {
    if (this.isDeleted) {
      throw new InvalidUserUpdateException(this.id.value);
    }
    if (props.displayName !== undefined) this._displayName = props.displayName;
    if (props.picture !== undefined)
      this._picture = Img.create(props.picture).orThrow();
    if (props.phoneNumber !== undefined)
      this._phoneNumber = Phone.create(props.phoneNumber).orThrow();
    if (props.status !== undefined) this._status = props.status;
    if (props.roleId !== undefined)
      this._roleId = UUID.create(props.roleId).orThrow();
    if (props.clinicId !== undefined)
      this._clinicId = UUID.create(props.clinicId).orThrow();

    this.addDomainEvent(
      new UpdateUserByStaffEvent({
        userId: this._id.value,
        actorId,
        action: LogAction.USER_UPDATE,
        type: LogType.INFO,
        details: 'Kullanıcı bilgileri başarıyla güncellendi.',
      })
    );
  }

  changeStatus(status: GlobalStatusType): void {
    this._status = status;
  }

  canSoftDelete(): boolean {
    return !(this.role && this.role.priority >= 100);
  }

  softDelete(): void {
    if (!this.canSoftDelete()) {
      throw new InvalidUserDeletionException();
    }

    if (this.isDeleted) {
      return;
    }

    this._deletedAt = new Date();
    this._status = GlobalStatusSchema.enum.DELETED;
  }

  toPersistence(): IUser {
    return {
      id: this._id.value,
      displayName: this._displayName,
      email: this._email.value,
      emailVerified: this._emailVerified,
      status: this._status,
      roleId: this._roleId.value,
      picture: this._picture?.value ?? null,
      phoneNumber: this._phoneNumber?.value ?? null,
      clinicId: this._clinicId?.value ?? null,
      lastLogin: this._lastLogin,
      createdAt: this._createdAt,
      updatedAt: DateTimeManager.create(),
      deletedAt: this._deletedAt,
    };
  }
}
