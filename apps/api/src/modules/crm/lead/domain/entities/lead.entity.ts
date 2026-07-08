import { Lead as ILead, LeadStatusSchema } from '@shared';
import { AggregateRoot } from '@common/domain/aggregate-root';
import { LeadSourceType as LeadSource } from '@input-type-schemas/LeadSourceSchema';
import { LeadMediumType as LeadMedium } from '@input-type-schemas/LeadMediumSchema';
import { LeadStatusType as LeadStatus } from '@input-type-schemas/LeadStatusSchema';
import {
  InvalidLeadStatusTransitionException,
  LeadAlreadyFinalizedException,
} from '@modules/crm/lead/domain/exceptions/lead.exceptions';
import { UUID } from '@src/domain/value-objects/uuid.vo';
import { Name } from '@src/domain/value-objects/name.vo';
import { Phone } from '@src/domain/value-objects/phone.vo';
import { Email } from '@src/domain/value-objects/email.vo';
import { DefaultValidateOptions } from '@common/domain/constants/default-options.constant';
import { shouldValidate } from '@common/domain/utils/should-validate';
import { DateTimeManager } from '@common/infrastructure/date-time/date-time.manager';
import { Guard } from '@common/domain/guards';
import {
  ConvertLeadProps,
  CreateLeadProps,
  MarkLostLeadProps,
} from '@modules/crm/lead/domain/contracts/lead-contracts';
import { LeadCreatedEvent } from '@modules/crm/lead/domain/events';
import {
  LogAction,
  LogSource,
  LogType,
} from '@src/domain/constants/log-action.constant';

export class Lead extends AggregateRoot {
  constructor(data: ILead) {
    super();
    this._id = UUID.fromTrusted(data.id);
    this._clinicId = UUID.fromTrusted(data.clinicId);
    this._source = data.source;
    this._status = data.status;
    this._name = data.name ? Name.fromTrusted(data.name) : null;
    this._phone = Phone.create(data.phone).instance ?? null;
    this._email = Email.create(data.email).instance ?? null;
    this._notes = data.notes;
    this._assignedToId = data.assignedToId;
    this._patientId = UUID.create(data.patientId).instance ?? null;
    this._appointmentId = UUID.create(data.appointmentId).instance ?? null;
    this._convertedAt = data.convertedAt;
    this._lostReason = data.lostReason;
    this._lostAt = data.lostAt;
    this._whatsAppConversationId = data.whatsAppConversationId;
    this._medium = data.medium;
    this._metaLeadId = data.metaLeadId;
    this._campaignId = data.campaignId;
    this._campaignName = data.campaignName;
    this._adId = data.adId;
    this._adsetId = data.adsetId;
    this._ctwaClid = data.ctwaClid;
    this._sourceUrl = data.sourceUrl;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
  }

  private _id: UUID;
  get id(): UUID {
    return this._id;
  }

  private _clinicId: UUID;
  get clinicId(): UUID {
    return this._clinicId;
  }

  private _source: LeadSource;
  get source(): LeadSource {
    return this._source;
  }

  private _status: LeadStatus;
  get status(): LeadStatus {
    return this._status;
  }

  private _name: Name | null;
  get name(): Name | null {
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

  private _notes: string | null;
  get notes(): string | null {
    return this._notes;
  }

  private _assignedToId: string | null;
  get assignedToId(): string | null {
    return this._assignedToId;
  }

  private _patientId: UUID | null;
  get patientId(): UUID | null {
    return this._patientId;
  }

  private _appointmentId: UUID | null;
  get appointmentId(): UUID | null {
    return this._appointmentId;
  }

  private _convertedAt: Date | null;
  get convertedAt(): Date | null {
    return this._convertedAt;
  }

  private _lostReason: string | null;
  get lostReason(): string | null {
    return this._lostReason;
  }

  private _lostAt: Date | null;
  get lostAt(): Date | null {
    return this._lostAt;
  }

  private _whatsAppConversationId: string | null;
  get whatsAppConversationId(): string | null {
    return this._whatsAppConversationId;
  }

  private _medium: LeadMedium | null;
  get medium(): LeadMedium | null {
    return this._medium;
  }

  private _metaLeadId: string | null;
  get metaLeadId(): string | null {
    return this._metaLeadId;
  }

  private _campaignId: string | null;
  get campaignId(): string | null {
    return this._campaignId;
  }

  private _campaignName: string | null;
  get campaignName(): string | null {
    return this._campaignName;
  }

  private _adId: string | null;
  get adId(): string | null {
    return this._adId;
  }

  private _adsetId: string | null;
  get adsetId(): string | null {
    return this._adsetId;
  }

  private _ctwaClid: string | null;
  get ctwaClid(): string | null {
    return this._ctwaClid;
  }

  private _sourceUrl: string | null;
  get sourceUrl(): string | null {
    return this._sourceUrl;
  }

  private _createdAt: Date;
  get createdAt(): Date {
    return this._createdAt;
  }

  private _updatedAt: Date;
  get updatedAt(): Date {
    return this._updatedAt;
  }

  private get _businessRulesValidator() {
    return {
      convert: () => {
        const isInValid =
          this._status === LeadStatusSchema.enum.CONVERTED ||
          this._status === LeadStatusSchema.enum.LOST;

        return {
          isValid: !isInValid,
          orThrow: () => {
            if (isInValid) throw new LeadAlreadyFinalizedException();
          },
        };
      },
      markLost: () => {
        const isInValid =
          this._status === LeadStatusSchema.enum.CONVERTED ||
          this._status === LeadStatusSchema.enum.LOST;

        return {
          isValid: !isInValid,
          orThrow: () => {
            if (isInValid) throw new LeadAlreadyFinalizedException();
          },
        };
      },
      qualify: () => {
        const isInvalid = this._status !== LeadStatusSchema.enum.CONTACTED;
        return {
          isValid: !isInvalid,
          orThrow: () => {
            if (isInvalid)
              throw new InvalidLeadStatusTransitionException(
                LeadStatusSchema.enum.CONTACTED
              );
          },
        };
      },
      contact: () => {
        const isInvalid = this._status !== LeadStatusSchema.enum.NEW;
        return {
          isValid: !isInvalid,
          orThrow: () => {
            if (isInvalid)
              throw new InvalidLeadStatusTransitionException(
                this._status,
                LeadStatusSchema.enum.NEW
              );
          },
        };
      },
    };
  }

  public static create(props: CreateLeadProps): Lead {
    const leadId = props.id ? UUID.create(props.id).orThrow() : UUID.generate();

    const now = DateTimeManager.create();

    const lead = new Lead({
      id: leadId.value,
      clinicId: UUID.create(props.clinicId).orThrow().value,
      source: props.source,
      status: LeadStatusSchema.enum.NEW,
      name: props.name ? Name.create(props.name).orThrow().value : null,
      phone: props.phone ? Phone.create(props.phone).orThrow().value : null,
      email: props.email ? Email.create(props.email).orThrow().value : null,
      notes: props.notes ?? null,
      assignedToId: props.assignedToId ?? null,
      patientId: null,
      appointmentId: null,
      convertedAt: null,
      lostReason: null,
      lostAt: null,
      whatsAppConversationId: props.whatsAppConversationId ?? null,
      medium: props.medium ?? null,
      metaLeadId: props.metaLeadId ?? null,
      campaignId: props.campaignId ?? null,
      campaignName: props.campaignName ?? null,
      adId: props.adId ?? null,
      adsetId: props.adsetId ?? null,
      ctwaClid: props.ctwaClid ?? null,
      sourceUrl: props.sourceUrl ?? null,
      createdAt: now,
      updatedAt: now,
    });

    // Audit event entity içinde raise edilir (kural: mümkün olduğunca entity'de). actorId ve
    // logSource entity'nin bilemeyeceği bağlam olduğundan props ile handler'dan geçirilir.
    lead.addDomainEvent(
      new LeadCreatedEvent({
        leadId: lead.id.value,
        clinicId: lead.clinicId.value,
        leadSource: lead.source,
        action: LogAction.LEAD_CREATED,
        type: LogType.INFO,
        source: props.logSource ?? LogSource.SYSTEM,
        actorId: props.actorId,
        details: `Lead oluşturuldu: ${lead.source}`,
      })
    );

    return lead;
  }

  public contact(options = DefaultValidateOptions): void {
    if (shouldValidate(options))
      this._businessRulesValidator.contact().orThrow();

    this._status = LeadStatusSchema.enum.CONTACTED;
  }

  public qualify(options = DefaultValidateOptions): void {
    if (shouldValidate(options))
      this._businessRulesValidator.qualify().orThrow();
    this._status = LeadStatusSchema.enum.QUALIFIED;
  }

  public convert({
    patientId,
    appointmentId,
    validateOptions = DefaultValidateOptions,
  }: ConvertLeadProps): void {
    if (shouldValidate(validateOptions))
      this._businessRulesValidator.convert().orThrow();

    this._patientId = patientId
      ? UUID.create(patientId).orThrow()
      : this._patientId;

    this._appointmentId = appointmentId
      ? UUID.create(appointmentId).orThrow()
      : this._appointmentId;

    this._status = LeadStatusSchema.enum.CONVERTED;
    this._convertedAt = DateTimeManager.create();

    // TODO: event fırlat ÖRN:
    //       leadId,
    //       clinicId,
    //       patientId,
    //       appointmentId,
    //       actorId: actor.userId,
    //       source: LogSource.WEB,
    //       action: LogAction.LEAD_CONVERTED,
    //       type: LogType.INFO,
    //       details: `Lead dönüştürüldü — hasta: ${saved.patientId?.value ?? '-'}, randevu: ${saved.appointmentId?.value ?? '-'}`,
  }

  public markLost({
    reason,
    actor: _,
    validateOptions = DefaultValidateOptions,
  }: MarkLostLeadProps): void {
    if (shouldValidate(validateOptions))
      this._businessRulesValidator.markLost().orThrow();

    this._status = LeadStatusSchema.enum.LOST;
    this._lostReason = reason ?? null;
    this._lostAt = DateTimeManager.create();

    // TODO: event fırlat ÖRN:  leadId,
    //         clinicId,
    //         lostReason,
    //         actorId,
    //         source,
    //         action: LogAction.LEAD_LOST,
    //         type: LogType.INFO,
    //         details: `Lead kaybedildi${dto.lostReason ? `: ${dto.lostReason}` : ''}`
  }

  public updateNotes(notes: string): void {
    this._notes = notes;
  }

  public isActive() {
    const isActive =
      this._status !== LeadStatusSchema.enum.CONVERTED &&
      this._status !== LeadStatusSchema.enum.LOST;
    return Guard.monitor(
      isActive,
      isActive,
      () => new Error('Lead aktif durumda değil')
    );
  }

  public toPersistence(): ILead {
    return {
      id: this._id.value,
      clinicId: this._clinicId.value,
      source: this._source,
      status: this._status,
      name: this._name?.value ?? null,
      phone: this._phone?.value ?? null,
      email: this._email?.value ?? null,
      notes: this._notes,
      assignedToId: this._assignedToId,
      patientId: this._patientId?.value ?? null,
      appointmentId: this._appointmentId?.value ?? null,
      convertedAt: this._convertedAt,
      lostReason: this._lostReason,
      lostAt: this._lostAt,
      whatsAppConversationId: this._whatsAppConversationId,
      medium: this._medium,
      metaLeadId: this._metaLeadId,
      campaignId: this._campaignId,
      campaignName: this._campaignName,
      adId: this._adId,
      adsetId: this._adsetId,
      ctwaClid: this._ctwaClid,
      sourceUrl: this._sourceUrl,
      createdAt: this._createdAt,
      updatedAt: DateTimeManager.create(),
    };
  }
}
