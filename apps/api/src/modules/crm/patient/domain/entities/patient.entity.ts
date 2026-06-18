import { Patient as IPatient, PatientStatusSchema } from '@shared';
import { AggregateRoot } from '@common/domain/aggregate-root';
import { GenderType as Gender } from '@input-type-schemas/GenderSchema';
import { BloodTypeType as BloodType } from '@input-type-schemas/BloodTypeSchema';
import { PatientStatusType as PatientStatus } from '@input-type-schemas/PatientStatusSchema';
import { PatientTypeType as PatientType } from '@input-type-schemas/PatientTypeSchema';
import { Decimal } from 'decimal.js';

export class Patient extends AggregateRoot implements IPatient {
  constructor(data: IPatient) {
    super();
    this._id = data.id;
    this._organizationId = data.organizationId;
    this._clinicId = data.clinicId;
    this._sectorId = data.sectorId;
    this._firstName = data.firstName;
    this._lastName = data.lastName;
    this._tcNo = data.tcNo;
    this._birthDate = data.birthDate;
    this._gender = data.gender;
    this._phone = data.phone;
    this._alternativePhone = data.alternativePhone;
    this._email = data.email;
    this._address = data.address;
    this._emergencyContact = data.emergencyContact;
    this._companionName = data.companionName;
    this._companionPhone = data.companionPhone;
    this._profilePhoto = data.profilePhoto;
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

  private _id: string;
  get id(): string {
    return this._id;
  }

  private _organizationId: string;
  get organizationId(): string {
    return this._organizationId;
  }

  private _clinicId: string | null;
  get clinicId(): string | null {
    return this._clinicId;
  }

  private _sectorId: string | null;
  get sectorId(): string | null {
    return this._sectorId;
  }

  private _firstName: string;
  get firstName(): string {
    return this._firstName;
  }

  private _lastName: string | null;
  get lastName(): string | null {
    return this._lastName;
  }

  private _tcNo: string | null;
  get tcNo(): string | null {
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

  private _phone: string;
  get phone(): string {
    return this._phone;
  }

  private _alternativePhone: string | null;
  get alternativePhone(): string | null {
    return this._alternativePhone;
  }

  private _email: string | null;
  get email(): string | null {
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

  private _companionPhone: string | null;
  get companionPhone(): string | null {
    return this._companionPhone;
  }

  private _profilePhoto: string | null;
  get profilePhoto(): string | null {
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

  // DOMAIN METHODS

  public activate(): void {
    if (this._status === PatientStatusSchema.enum.ACTIVE) return;
    this._status = PatientStatusSchema.enum.ACTIVE;
    this._deletedAt = null;
  }

  public deactivate(): void {
    if (this._status === PatientStatusSchema.enum.INACTIVE) return;
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

  public softDelete(): void {
    this._deletedAt = new Date();
  }

  // STATUS QUERIES

  public isActive(): boolean {
    return this._status === PatientStatusSchema.enum.ACTIVE;
  }
  public isInactive(): boolean {
    return this._status === PatientStatusSchema.enum.INACTIVE;
  }
  public isArchived(): boolean {
    return this._status === PatientStatusSchema.enum.ARCHIVED;
  }
  public isBlacklisted(): boolean {
    return this._status === PatientStatusSchema.enum.BLACKLISTED;
  }
  public isDeceased(): boolean {
    return this._status === PatientStatusSchema.enum.DECEASED;
  }
  public isDeleted(): boolean {
    return this._deletedAt !== null;
  }

  public fullName(): string {
    return this._lastName
      ? `${this._firstName} ${this._lastName}`
      : this._firstName;
  }

  public toPersistence(): IPatient {
    return {
      id: this._id,
      organizationId: this._organizationId,
      clinicId: this._clinicId,
      sectorId: this._sectorId,
      firstName: this._firstName,
      lastName: this._lastName,
      tcNo: this._tcNo,
      birthDate: this._birthDate,
      gender: this._gender,
      phone: this._phone,
      alternativePhone: this._alternativePhone,
      email: this._email,
      address: this._address,
      emergencyContact: this._emergencyContact,
      companionName: this._companionName,
      companionPhone: this._companionPhone,
      profilePhoto: this._profilePhoto,
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
      updatedAt: new Date(),
      deletedAt: this._deletedAt,
    };
  }
}
