import { Patient as IPatient, PatientStatusSchema } from '@shared';
import { AggregateRoot } from '@common/domain/aggregate-root';
import { GenderType as Gender } from '@input-type-schemas/GenderSchema';
import { BloodTypeType as BloodType } from '@input-type-schemas/BloodTypeSchema';
import { PatientStatusType as PatientStatus } from '@input-type-schemas/PatientStatusSchema';
import { PatientTypeType as PatientType } from '@input-type-schemas/PatientTypeSchema';
import { Decimal } from 'decimal.js';
import { CreatePatientProps } from '@modules/crm/patient/domain/patient.contracts';
import { FirebaseUid } from '@src/domain/value-objects/firebase-uid.vo';
import { UUID } from '@src/domain/value-objects/uuid.vo';
import { DateTimeManager } from '@common/infrastructure/date-time/date-time.manager';
import { Guard } from '@common/domain/guards';
import { TckNo } from '@src/domain/value-objects/tck-no.vo';
import { Phone } from '@src/domain/value-objects/phone.vo';
import { Email } from '@src/domain/value-objects/email.vo';
import { Img } from '@src/domain/value-objects/img.vo';
import { LastName } from '@src/domain/value-objects/last-name.vo';
import { Name } from '@src/domain/value-objects/name.vo';

export class Patient extends AggregateRoot {
  constructor(data: IPatient) {
    super();
    this._id = UUID.fromTrusted(data.id);
    this._organizationId = UUID.fromTrusted(data.organizationId);

    if (data.clinicId) this._clinicId = UUID.fromTrusted(data.clinicId);

    if (data.sectorId) this._sectorId = UUID.fromTrusted(data.sectorId);

    this._firstName = Name.fromTrusted(data.firstName);

    this._lastName = data.lastName ? LastName.create(data.lastName) : null;

    if (data.tcNo) this._tcNo = TckNo.fromTrusted(data.tcNo);

    this._birthDate = data.birthDate;
    this._gender = data.gender;

    if (data.phone) this._phone = Phone.fromTrusted(data.phone);

    if (data.alternativePhone)
      this._alternativePhone = Phone.fromTrusted(data.alternativePhone);

    if (data.email) this._email = Email.fromTrusted(data.email);

    if (data.firebaseUid)
      this._firebaseUid = FirebaseUid.fromTrusted(data.firebaseUid);

    this._address = data.address;
    this._emergencyContact = data.emergencyContact;
    this._companionName = data.companionName;

    if (data.companionPhone)
      this._companionPhone = Phone.fromTrusted(data.companionPhone);

    if (data.profilePhoto)
      this._profilePhoto = Img.fromTrusted(data.profilePhoto);

    this._protocolNo = data.protocolNo;
    this._allergies = data.allergies;
    this._chronicDiseases = data.chronicDiseases;
    this._bloodType = data.bloodType;
    this._status = data.status;
    this._patientType = data.patientType;
    this._responsibleProviderId = data.responsibleProviderId;
    this._checkupDate = data.checkupDate;
    this._discountRate = data.discountRate;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
    this._deletedAt = data.deletedAt;
  }

  private _id: UUID;
  get id(): UUID {
    return this._id;
  }

  private _firebaseUid: FirebaseUid | null;
  get firebaseUid(): FirebaseUid | null {
    return this._firebaseUid;
  }

  private _organizationId: UUID;
  get organizationId(): UUID {
    return this._organizationId;
  }

  private _clinicId: UUID | null;
  get clinicId(): UUID | null {
    return this._clinicId;
  }

  private _sectorId: UUID | null;
  get sectorId(): UUID | null {
    return this._sectorId;
  }

  private _firstName: Name;
  get firstName(): Name {
    return this._firstName;
  }

  private _lastName: LastName | null;
  get lastName(): LastName | null {
    return this._lastName;
  }

  private _tcNo: TckNo | null;
  get tcNo(): TckNo | null {
    return this._tcNo;
  }

  private _birthDate: Date | null;
  get birthDate(): Date | null {
    return this._birthDate;
  }

  private _gender: Gender | null;
  get gender(): Gender | null {
    return this._gender;
  }

  private _phone: Phone | null;
  get phone(): Phone | null {
    return this._phone;
  }

  private _alternativePhone: Phone | null;

  get alternativePhone(): Phone | null {
    return this._alternativePhone;
  }

  private _email: Email | null;

  get email(): Email | null {
    return this._email;
  }

  private _address: string | null;

  get address(): string | null {
    return this._address;
  }

  private _emergencyContact: string | null;

  get emergencyContact(): string | null {
    return this._emergencyContact;
  }

  private _companionName: string | null;

  get companionName(): string | null {
    return this._companionName;
  }

  private _companionPhone: Phone | null;

  get companionPhone(): Phone | null {
    return this._companionPhone;
  }

  private _profilePhoto: Img | null;

  get profilePhoto(): Img | null {
    return this._profilePhoto;
  }

  private _protocolNo: string | null;

  get protocolNo(): string | null {
    return this._protocolNo;
  }

  private _allergies: string | null;

  get allergies(): string | null {
    return this._allergies;
  }

  private _chronicDiseases: string | null;

  get chronicDiseases(): string | null {
    return this._chronicDiseases;
  }

  private _bloodType: BloodType | null;

  get bloodType(): BloodType | null {
    return this._bloodType;
  }

  private _status: PatientStatus;

  get status(): PatientStatus {
    return this._status;
  }

  private _patientType: PatientType | null;

  get patientType(): PatientType | null {
    return this._patientType;
  }

  private _responsibleProviderId: string | null;

  get responsibleProviderId(): string | null {
    return this._responsibleProviderId;
  }

  private _checkupDate: Date | null;

  get checkupDate(): Date | null {
    return this._checkupDate;
  }

  private _discountRate: Decimal | null;

  get discountRate(): Decimal | null {
    return this._discountRate;
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

  public get validate() {
    return {
      hasPhone: this._hasPhone(),
      status: {
        isActive: this._isActive(),
        isInactive: this._isInactive(),
        isArchived: this._isArchived(),
        isBlackListed: this._isBlacklisted(),
        isDeceased: this._isDeceased(),
      },
      mode: {
        isClinicInline: this._isClinicInline(),
      },
    };
  }

  public static create(props: CreatePatientProps): Patient {
    const firstName = Name.create(props.firstName).orThrow();

    const lastName = props.lastName ? LastName.create(props.lastName) : null;

    const organizationId = UUID.create(props.organizationId).orThrow();

    const clinicId = props.clinicId
      ? UUID.create(props.clinicId).orThrow()
      : null;

    const sectorId = props.sectorId
      ? UUID.create(props.sectorId).orThrow()
      : null;

    const phone = props.phone ? Phone.create(props.phone).orThrow() : null;

    const alternativePhone = props.alternativePhone
      ? Phone.create(props.alternativePhone).orThrow()
      : null;

    const companionPhone = props.companionPhone
      ? Phone.create(props.companionPhone).orThrow()
      : null;

    const email = props.email ? Email.create(props.email).orThrow() : null;

    const tcNo = props.tcNo ? TckNo.create(props.tcNo).orThrow() : null;

    const firebaseUid = props.firebaseUid
      ? FirebaseUid.create(props.firebaseUid).orThrow()
      : null;

    const profilePhoto = props.profilePhoto
      ? Img.create(props.profilePhoto).orThrow()
      : null;

    const now = DateTimeManager.create();

    const id = props.id ? UUID.create(props.id).orThrow() : UUID.generate();

    return new Patient({
      id: id.value,
      organizationId: organizationId.value,
      clinicId: clinicId?.value ?? null,
      sectorId: sectorId?.value ?? null,
      phone: phone?.value ?? null,
      firstName: firstName.value,
      lastName: lastName?.value ?? null,
      tcNo: tcNo?.value ?? null,
      birthDate: props.birthDate ?? null,
      gender: props.gender ?? null,
      alternativePhone: alternativePhone?.value ?? null,
      email: email?.value ?? null,
      address: props.address ?? null,
      emergencyContact: props.emergencyContact ?? null,
      companionName: props.companionName ?? null,
      companionPhone: companionPhone?.value ?? null,
      profilePhoto: profilePhoto?.value ?? null,
      protocolNo: props.protocolNo ?? null,
      allergies: props.allergies ?? null,
      chronicDiseases: props.chronicDiseases ?? null,
      bloodType: props.bloodType ?? null,
      patientType: props.patientType ?? null,
      responsibleProviderId: props.responsibleProviderId ?? null,
      checkupDate: props.checkupDate ?? null,
      discountRate: props.discountRate ?? null,
      status: PatientStatusSchema.enum.ACTIVE,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      firebaseUid: firebaseUid?.value ?? null,
    });
  }

  public linkFirebaseAccount(firebaseUid: string): void {
    this._firebaseUid = FirebaseUid.create(firebaseUid).orThrow();
  }

  public activate(): void {
    if (this._isActive().value) return;
    this._status = PatientStatusSchema.enum.ACTIVE;
    this._deletedAt = null;
  }

  public deactivate(): void {
    if (this._isInactive().value) return;
    this._status = PatientStatusSchema.enum.INACTIVE;
  }

  public archive(): void {
    if (this._status === PatientStatusSchema.enum.ARCHIVED) return;
    this._status = PatientStatusSchema.enum.ARCHIVED;
  }

  public blacklist(): void {
    this._status = PatientStatusSchema.enum.BLACKLISTED;
  }

  public markDeceased(): void {
    this._status = PatientStatusSchema.enum.DECEASED;
  }

  // STATUS QUERIES

  public softDelete(): void {
    this._deletedAt = new Date();
  }

  public fullName(): string {
    return this._lastName
      ? `${this._firstName.value} ${this._lastName.value}`
      : this._firstName.value;
  }

  public toPersistence(): IPatient {
    return {
      id: this._id.value,
      organizationId: this._organizationId.value,
      clinicId: this._clinicId?.value ?? null,
      sectorId: this._sectorId?.value ?? null,
      firstName: this._firstName.value,
      lastName: this._lastName?.value ?? null,
      tcNo: this._tcNo?.value ?? null,
      birthDate: this._birthDate,
      gender: this._gender,
      phone: this._phone?.value ?? null,
      alternativePhone: this._alternativePhone?.value ?? null,
      email: this._email?.value ?? null,
      address: this._address,
      emergencyContact: this._emergencyContact,
      companionName: this._companionName,
      companionPhone: this._companionPhone?.value ?? null,
      profilePhoto: this._profilePhoto?.value ?? null,
      protocolNo: this._protocolNo,
      allergies: this._allergies,
      chronicDiseases: this._chronicDiseases,
      bloodType: this._bloodType,
      status: this._status,
      patientType: this._patientType,
      responsibleProviderId: this._responsibleProviderId,
      checkupDate: this._checkupDate,
      discountRate: this._discountRate,
      createdAt: this._createdAt,
      updatedAt: DateTimeManager.create(),
      deletedAt: this._deletedAt,
      firebaseUid: this._firebaseUid?.value ?? null,
    };
  }

  private _isActive(): Guard<boolean> {
    const isValid = this._status === PatientStatusSchema.enum.ACTIVE;
    return Guard.monitor(isValid, isValid, () => new Error());
  }

  private _isInactive() {
    const isValid = this._status === PatientStatusSchema.enum.INACTIVE;
    return Guard.monitor(isValid, isValid, () => new Error());
  }

  private _isArchived() {
    const isValid = this._status === PatientStatusSchema.enum.ARCHIVED;
    return Guard.monitor(isValid, isValid, () => new Error());
  }

  private _isBlacklisted(): Guard<boolean> {
    const isValid = this._status === PatientStatusSchema.enum.BLACKLISTED;
    return Guard.monitor(isValid, isValid, () => new Error());
  }

  private _isDeceased(): Guard<boolean> {
    const isValid = this._status === PatientStatusSchema.enum.DECEASED;
    return Guard.monitor(isValid, isValid, () => new Error());
  }

  private _isDeleted(): Guard<boolean> {
    const isValid = this._deletedAt !== null;
    return Guard.monitor(isValid, isValid, () => new Error());
  }

  private _isClinicInline(): Guard<boolean> {
    const isFirebaseUser = !!this._firebaseUid?.value;
    return Guard.monitor(!isFirebaseUser, !isFirebaseUser, () => new Error());
  }

  private _hasPhone(): Guard<boolean> {
    const isValid = this._phone !== null;
    return Guard.monitor(isValid, isValid, () => new Error());
  }
}
