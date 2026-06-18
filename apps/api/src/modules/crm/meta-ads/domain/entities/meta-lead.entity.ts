import {
  MetaAdAccount,
  MetaLead as IMetaLead,
  MetaLeadStatusSchema,
} from '@shared';
import { AggregateRoot } from '@common/domain/aggregate-root';
import { JsonValueType as JsonValue } from '@input-type-schemas/JsonValueSchema';
import { MetaLeadStatusType as MetaLeadStatus } from '@input-type-schemas/MetaLeadStatusSchema';

export class MetaLead extends AggregateRoot implements IMetaLead {
  constructor(data: IMetaLead) {
    super();
    this._id = data.id;
    this._metaAdAccountId = data.metaAdAccountId;
    this._metaLeadId = data.metaLeadId;
    this._formId = data.formId;
    this._campaignId = data.campaignId;
    this._campaignName = data.campaignName;
    this._adsetId = data.adsetId;
    this._adId = data.adId;
    this._name = data.name;
    this._phone = data.phone;
    this._email = data.email;
    this._rawData = data.rawData;
    this._status = data.status;
    this._matchedPatientId = data.matchedPatientId;
    this._matchedAppointmentId = data.matchedAppointmentId;
    this._matchedAt = data.matchedAt;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
  }

  private _id: string;
  get id(): string {
    return this._id;
  }

  private _metaAdAccountId: string;
  get metaAdAccountId(): string {
    return this._metaAdAccountId;
  }

  private _metaLeadId: string;
  get metaLeadId(): string {
    return this._metaLeadId;
  }

  private _formId: string | null;
  get formId(): string | null {
    return this._formId;
  }

  private _campaignId: string | null;
  get campaignId(): string | null {
    return this._campaignId;
  }

  private _campaignName: string | null;
  get campaignName(): string | null {
    return this._campaignName;
  }

  private _adsetId: string | null;
  get adsetId(): string | null {
    return this._adsetId;
  }

  private _adId: string | null;
  get adId(): string | null {
    return this._adId;
  }

  private _name: string | null;
  get name(): string | null {
    return this._name;
  }

  private _phone: string | null;
  get phone(): string | null {
    return this._phone;
  }

  private _email: string | null;
  get email(): string | null {
    return this._email;
  }

  private _rawData: JsonValue;
  get rawData(): JsonValue {
    return this._rawData;
  }

  private _status: MetaLeadStatus;
  get status(): MetaLeadStatus {
    return this._status;
  }

  private _matchedPatientId: string | null;
  get matchedPatientId(): string | null {
    return this._matchedPatientId;
  }

  private _matchedAppointmentId: string | null;
  get matchedAppointmentId(): string | null {
    return this._matchedAppointmentId;
  }

  private _matchedAt: Date | null;
  get matchedAt(): Date | null {
    return this._matchedAt;
  }

  private _createdAt: Date;
  get createdAt(): Date {
    return this._createdAt;
  }

  private _updatedAt: Date;
  get updatedAt(): Date {
    return this._updatedAt;
  }

  // Prisma relation stub
  get metaAdAccount(): MetaAdAccount {
    return {} as MetaAdAccount;
  }

  public matchToPatient(patientId: string): void {
    this._matchedPatientId = patientId;
    this._status = MetaLeadStatusSchema.enum.MATCHED;
    this._matchedAt = new Date();
  }

  public markConverted(appointmentId: string): void {
    this._matchedAppointmentId = appointmentId;
    this._status = MetaLeadStatusSchema.enum.CONVERTED;
    if (!this._matchedAt) this._matchedAt = new Date();
  }

  public markInvalid(): void {
    this._status = MetaLeadStatusSchema.enum.INVALID;
  }

  public isNew(): boolean {
    return this._status === MetaLeadStatusSchema.enum.NEW;
  }

  public toPersistence(): IMetaLead {
    return {
      id: this._id,
      metaAdAccountId: this._metaAdAccountId,
      metaLeadId: this._metaLeadId,
      formId: this._formId,
      campaignId: this._campaignId,
      campaignName: this._campaignName,
      adsetId: this._adsetId,
      adId: this._adId,
      name: this._name,
      phone: this._phone,
      email: this._email,
      rawData: this._rawData,
      status: this._status,
      matchedPatientId: this._matchedPatientId,
      matchedAppointmentId: this._matchedAppointmentId,
      matchedAt: this._matchedAt,
      createdAt: this._createdAt,
      updatedAt: new Date(),
    };
  }
}
