import type { User as IUser } from '@shared';
import {
  GlobalStatusSchema,
  GlobalStatusType,
} from '@input-type-schemas/GlobalStatusSchema';
import { AggregateRoot } from '@common/domain/aggregate-root';
import { UserUpdatedEvent } from '@modules/identity/user/domain/events/user-updated.event';
import { LogAction, LogType } from '@src/domain/constants/log-action.constant';
import {
  CreateUserProps,
  UpdateDetailsProps,
} from '@modules/identity/user/domain/contracts/user.contracts';
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
import { FullName } from '@src/domain/value-objects/full-name.vo';
import { isNotUndefined } from '@common/utils/is-not-undefined';
import { isDefined } from '@common/utils';
import { Priority } from '@src/domain/value-objects/priority.vo';
import { UserDeletedEvent } from '@modules/identity/user/domain/events/delete-user.event';

export type UserRoleRef = { id: string; priority: Priority };
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
    this._displayName = FullName.fromTrusted(data.displayName);
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

  private _displayName: FullName;

  get displayName(): FullName {
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

  get canSoftDelete() {
    let canSoft = true;

    if (this.role && this.role.priority.validate.isAdmin.value) canSoft = false;

    return Guard.monitor(
      canSoft,
      canSoft,
      () => new InvalidUserDeletionException()
    );
  }

  static create(props: CreateUserProps): User {
    const now = DateTimeManager.create();
    return new User({
      id: FirebaseUid.create(props.id).orThrow().value,
      email: Email.create(props.email).orThrow().value,
      displayName: FullName.fromTrusted(props.displayName).value,
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
      this.managedClinicIds?.some(({ value: id }) => id === clinicId) ?? false
    );
  }

  updateDetails(props: UpdateDetailsProps, actorId: string): void {
    if (this.isDeleted) {
      throw new InvalidUserUpdateException(this.id.value);
    }
    if (isDefined(props.displayName))
      this._displayName = FullName.create(props.displayName).orThrow();
    if (isNotUndefined(props.picture))
      this._picture = Img.create(props.picture).orThrow();
    if (isNotUndefined(props.phoneNumber))
      this._phoneNumber = props.phoneNumber
        ? Phone.create(props.phoneNumber).orThrow()
        : null;
    if (isDefined(props.status)) this._status = props.status;
    if (isDefined(props.roleId))
      this._roleId = UUID.create(props.roleId).orThrow();
    if (isDefined(props.clinicId))
      this._clinicId = UUID.create(props.clinicId).orThrow();

    // Kapsam atamaları: `undefined` dokunulmaz, `[]` listeyi temizler. Bu alanlar
    // yetki devridir — hangi kliniğin/organizasyonun atanabileceği kararı çağıran
    // handler'da verilir; entity yalnız kimlik formatını doğrular.
    if (isNotUndefined(props.managedClinicIds))
      this._managedClinicIds = props.managedClinicIds.map((id) =>
        UUID.create(id).orThrow()
      );

    if (isNotUndefined(props.ownedOrganizationIds))
      this._ownedOrganizationIds = props.ownedOrganizationIds.map((id) =>
        UUID.create(id).orThrow()
      );

    this._updatedAt = DateTimeManager.create();

    this.addDomainEvent(
      new UserUpdatedEvent({
        userId: this.id.value,
        actorId,
        action: LogAction.USER_UPDATE,
        type: LogType.INFO,
        details: 'Kullanıcı bilgileri başarıyla güncellendi.',
      })
    );
  }

  changeStatus(status: GlobalStatusType): void {
    this._status = status;
    this._updatedAt = DateTimeManager.create();
  }

  softDelete(actorId: string): void {
    this.canSoftDelete.orThrow();
    if (this.isDeleted) return;

    this.addDomainEvent(
      new UserDeletedEvent({
        userId: this.id.value,
        action: LogAction.USER_DELETE,
        type: LogType.INFO,
        details: 'Kullanıcı silindi',
        actorId,
      })
    );

    this._deletedAt = DateTimeManager.create();
    this._updatedAt = DateTimeManager.create();
    this._status = GlobalStatusSchema.enum.DELETED;
  }

  toPersistence(): IUser {
    return {
      id: this.id.value,
      displayName: this.displayName.value,
      email: this.email.value,
      emailVerified: this.emailVerified,
      status: this.status,
      roleId: this.roleId.value,
      picture: this.picture?.value ?? null,
      phoneNumber: this.phoneNumber?.value ?? null,
      clinicId: this.clinicId?.value ?? null,
      lastLogin: this.lastLogin,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt,
    };
  }
}
