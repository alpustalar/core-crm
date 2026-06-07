import { Lead as ILead, LeadSource, LeadStatus } from '@prisma/client';
import { AggregateRoot } from '@common/domain/aggregate-root';
import { BadRequestException } from '@nestjs/common';

export class Lead extends AggregateRoot implements ILead {
  constructor(data: ILead) {
    super();
    this._id = data.id;
    this._clinicId = data.clinicId;
    this._source = data.source;
    this._status = data.status;
    this._name = data.name;
    this._phone = data.phone;
    this._email = data.email;
    this._notes = data.notes;
    this._assignedToId = data.assignedToId;
    this._patientId = data.patientId;
    this._appointmentId = data.appointmentId;
    this._convertedAt = data.convertedAt;
    this._lostReason = data.lostReason;
    this._lostAt = data.lostAt;
    this._whatsAppConversationId = data.whatsAppConversationId;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
  }

  private _id: string;
  get id(): string { return this._id; }

  private _clinicId: string;
  get clinicId(): string { return this._clinicId; }

  private _source: LeadSource;
  get source(): LeadSource { return this._source; }

  private _status: LeadStatus;
  get status(): LeadStatus { return this._status; }

  private _name: string | null;
  get name(): string | null { return this._name; }

  private _phone: string | null;
  get phone(): string | null { return this._phone; }

  private _email: string | null;
  get email(): string | null { return this._email; }

  private _notes: string | null;
  get notes(): string | null { return this._notes; }

  private _assignedToId: string | null;
  get assignedToId(): string | null { return this._assignedToId; }

  private _patientId: string | null;
  get patientId(): string | null { return this._patientId; }

  private _appointmentId: string | null;
  get appointmentId(): string | null { return this._appointmentId; }

  private _convertedAt: Date | null;
  get convertedAt(): Date | null { return this._convertedAt; }

  private _lostReason: string | null;
  get lostReason(): string | null { return this._lostReason; }

  private _lostAt: Date | null;
  get lostAt(): Date | null { return this._lostAt; }

  private _whatsAppConversationId: string | null;
  get whatsAppConversationId(): string | null { return this._whatsAppConversationId; }

  private _createdAt: Date;
  get createdAt(): Date { return this._createdAt; }

  private _updatedAt: Date;
  get updatedAt(): Date { return this._updatedAt; }

  public contact(): void {
    if (this._status !== LeadStatus.NEW) {
      throw new BadRequestException('Yalnızca NEW statüsündeki leadler iletişime geçildi olarak işaretlenebilir.');
    }
    this._status = LeadStatus.CONTACTED;
  }

  public qualify(): void {
    if (this._status !== LeadStatus.CONTACTED) {
      throw new BadRequestException('Yalnızca CONTACTED statüsündeki leadler nitelikli olarak işaretlenebilir.');
    }
    this._status = LeadStatus.QUALIFIED;
  }

  public convert(patientId: string | null, appointmentId: string | null): void {
    if (this._status === LeadStatus.CONVERTED || this._status === LeadStatus.LOST) {
      throw new BadRequestException('Dönüştürülmüş veya kaybedilmiş leadler tekrar dönüştürülemez.');
    }
    this._patientId = patientId ?? this._patientId;
    this._appointmentId = appointmentId ?? this._appointmentId;
    this._status = LeadStatus.CONVERTED;
    this._convertedAt = new Date();
  }

  public markLost(reason?: string): void {
    if (this._status === LeadStatus.CONVERTED || this._status === LeadStatus.LOST) {
      throw new BadRequestException('Bu lead zaten dönüştürülmüş veya kaybedilmiş.');
    }
    this._status = LeadStatus.LOST;
    this._lostReason = reason ?? null;
    this._lostAt = new Date();
  }

  public updateNotes(notes: string): void {
    this._notes = notes;
  }

  public isActive(): boolean {
    return this._status !== LeadStatus.CONVERTED && this._status !== LeadStatus.LOST;
  }

  public toPersistence(): ILead {
    return {
      id: this._id,
      clinicId: this._clinicId,
      source: this._source,
      status: this._status,
      name: this._name,
      phone: this._phone,
      email: this._email,
      notes: this._notes,
      assignedToId: this._assignedToId,
      patientId: this._patientId,
      appointmentId: this._appointmentId,
      convertedAt: this._convertedAt,
      lostReason: this._lostReason,
      lostAt: this._lostAt,
      whatsAppConversationId: this._whatsAppConversationId,
      createdAt: this._createdAt,
      updatedAt: new Date(),
    };
  }
}
