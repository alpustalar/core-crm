import {
  MetaAdAccount,
  MetaLead as IMetaLead,
  MetaLeadStatusSchema,
} from '@shared';
import { AggregateRoot } from '@common/domain/aggregate-root';
import { JsonValueType as JsonValue } from '@input-type-schemas/JsonValueSchema';
import { MetaLeadStatusType as MetaLeadStatus } from '@input-type-schemas/MetaLeadStatusSchema';
import { UUID } from '@src/domain/value-objects/uuid.vo';
import { Phone } from '@src/domain/value-objects/phone.vo';
import { Email } from '@src/domain/value-objects/email.vo';
import { CreateMetaLeadProps } from '@modules/crm/meta-ads/domain/contracts/meta-lead.contracts';
import { DateTimeManager, isEmpty } from '@common/utils';

export class MetaLead extends AggregateRoot {
  constructor(data: IMetaLead) {
    super();
    this._id = UUID.fromTrusted(data.id);
    this._metaAdAccountId = data.metaAdAccountId;
    this._metaLeadId = data.metaLeadId;
    this._formId = data.formId;
    this._campaignId = data.campaignId;
    this._campaignName = data.campaignName;
    this._adsetId = data.adsetId;
    this._adId = data.adId;
    this._name = data.name;
    this._phone = Phone.create(data.phone).instance ?? null;
    this._email = Email.create(data.email).instance ?? null;
    this._rawData = data.rawData;
    this._status = data.status;
    this._matchedPatientId = data.matchedPatientId;
    this._matchedAppointmentId =
      UUID.create(data.matchedAppointmentId).instance ?? null;
    this._matchedAt = data.matchedAt;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
  }

  private _id: UUID;
  get id(): UUID {
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

  private _phone: Phone | null;
  get phone(): Phone | null {
    return this._phone;
  }

  private _email: Email | null;
  get email(): Email | null {
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

  private _matchedAppointmentId: UUID | null;
  get matchedAppointmentId(): UUID | null {
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

  public static create(props: CreateMetaLeadProps): MetaLead {
    const phoneVO = props.phone ? Phone.create(props.phone).orThrow() : null;
    const emailVO = props.email ? Email.create(props.email).orThrow() : null;

    if (isEmpty(props.metaLeadId)) {
      throw new Error(
        'Meta Lead ID (metaLeadId) olmadan ham kayıt oluşturulamaz.'
      );
    }

    const now = DateTimeManager.create();

    return new MetaLead({
      id: UUID.createOrGenerate(props.id).value,
      metaAdAccountId: props.metaAdAccountId,
      metaLeadId: props.metaLeadId,
      formId: props.formId ?? null,
      campaignId: props.campaignId ?? null,
      campaignName: props.campaignName ?? null,
      adsetId: props.adsetId ?? null,
      adId: props.adId ?? null,
      name: props.name ?? null,
      phone: phoneVO ? phoneVO.value : null,
      email: emailVO ? emailVO.value : null,
      rawData: props.rawData,
      status: MetaLeadStatusSchema.enum.NEW,
      matchedPatientId: null,
      matchedAppointmentId: null,
      matchedAt: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  public matchToPatient(patientId: string): void {
    this._matchedPatientId = patientId;
    this._status = MetaLeadStatusSchema.enum.MATCHED;
    this._matchedAt = DateTimeManager.create();
  }

  public markConverted(appointmentId: string): void {
    this._matchedAppointmentId = UUID.create(appointmentId).orThrow();
    this._status = MetaLeadStatusSchema.enum.CONVERTED;
    if (!this._matchedAt) this._matchedAt = DateTimeManager.create();
  }

  public markInvalid(): void {
    this._status = MetaLeadStatusSchema.enum.INVALID;
  }

  public isNew(): boolean {
    return this._status === MetaLeadStatusSchema.enum.NEW;
  }

  public toPersistence(): IMetaLead {
    return {
      id: this.id.value,
      metaAdAccountId: this.metaAdAccountId,
      metaLeadId: this.metaLeadId,
      formId: this.formId,
      campaignId: this.campaignId,
      campaignName: this.campaignName,
      adsetId: this.adsetId,
      adId: this.adId,
      name: this.name,
      phone: this.phone?.value ?? null,
      email: this.email?.value ?? null,
      rawData: this.rawData,
      status: this.status,
      matchedPatientId: this.matchedPatientId,
      matchedAppointmentId: this.matchedAppointmentId?.value ?? null,
      matchedAt: this.matchedAt,
      createdAt: this.createdAt,
      updatedAt: DateTimeManager.create(),
    };
  }
}
