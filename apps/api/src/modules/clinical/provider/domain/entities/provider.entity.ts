import { Provider as IProvider } from '@model-schema/ProviderSchema';
import {
  OperationModeSchema,
  OperationModeType as OperationMode,
} from '@input-type-schemas/OperationModeSchema';
import { AggregateRoot } from '@common/domain/aggregate-root';

import { ProviderCreatedEvent } from '@modules/clinical/provider/domain/events/provider-created.event';
import { ProviderSoftDeletedEvent } from '@modules/clinical/provider/domain/events/provider-soft-deleted.event';
import { UpdateProviderInfo } from '@shared/modules/provider/types/update-provider-info.type';
import { CreateProviderProps } from '@modules/clinical/provider/domain/contracts';
import {
  ProviderAlreadyDeleted,
  ProviderNotAcceptingExaminationException,
  ProviderNotShiftModeException,
  ProviderNotStaticModeException,
} from '@modules/clinical/provider/domain/exceptions/provider.exceptions';
import { Guard } from '@common/domain/guards';
import { DateTimeManager, isDefined } from '@common/utils';
import { UUID } from '@src/domain/value-objects/uuid.vo';
import { Phone } from '@src/domain/value-objects/phone.vo';
import { Email } from '@src/domain/value-objects/email.vo';
import { isNotUndefined } from '@common/utils/is-not-undefined';

export class Provider extends AggregateRoot {
  constructor(data: IProvider) {
    super();
    this._id = UUID.fromTrusted(data.id);
    this._providerTitleId = UUID.create(data.providerTitleId).instance ?? null;
    this._providerSpecialtyId =
      UUID.create(data.providerSpecialtyId).instance ?? null;

    this._publicPhone = Phone.create(data.publicPhone).instance ?? null;

    this._publicEmail = Email.create(data.publicEmail).instance ?? null;

    this._diplomaNo = data.diplomaNo;
    this._hlrNo = data.hlrNo;
    this._isActive = data.isActive;
    this._operationMode = data.operationMode;
    this._clinicId = UUID.fromTrusted(data.clinicId);
    this._userId = UUID.fromTrusted(data.userId);
    this._sectorId = UUID.create(data.sectorId).instance ?? null;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
    this._deletedAt = data.deletedAt;
    this._acceptsConsultation = data.acceptsConsultation;
  }

  private _acceptsConsultation: boolean;

  get acceptsConsultation(): boolean {
    return this._acceptsConsultation;
  }

  private _id: UUID;

  // --- Getters ---
  get id(): UUID {
    return this._id;
  }

  private _providerTitleId: UUID | null;

  get providerTitleId(): UUID | null {
    return this._providerTitleId;
  }

  private _providerSpecialtyId: UUID | null;

  get providerSpecialtyId(): UUID | null {
    return this._providerSpecialtyId;
  }

  private _publicPhone: Phone | null;

  get publicPhone(): Phone | null {
    return this._publicPhone;
  }

  private _publicEmail: Email | null;

  get publicEmail(): Email | null {
    return this._publicEmail;
  }

  private _diplomaNo: string | null;

  get diplomaNo(): string | null {
    return this._diplomaNo;
  }

  private _hlrNo: string | null;

  get hlrNo(): string | null {
    return this._hlrNo;
  }

  private _isActive: boolean;

  get isActive(): boolean {
    return this._isActive;
  }

  private _operationMode: OperationMode;

  get operationMode(): OperationMode {
    return this._operationMode;
  }

  private _clinicId: UUID;

  get clinicId(): UUID {
    return this._clinicId;
  }

  private _userId: UUID;

  get userId(): UUID {
    return this._userId;
  }

  private _sectorId: UUID | null;

  get sectorId(): UUID | null {
    return this._sectorId;
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
  get isDeleted(): boolean {
    return !!this._deletedAt;
  }

  public get validate() {
    return {
      operationMode: {
        isStatic: this.isStaticMode,
        isShift: this.isShiftMode,
      },
      canAcceptConsultation: this.canAcceptConsultation(),
      isDeleted: this._isDeleted,
      isActive: this.validateIsActive,
    };
  }

  private get isStaticMode() {
    const isStatic = this._operationMode === OperationModeSchema.enum.STATIC;

    return Guard.monitor(
      isStatic,
      isStatic,
      () => new ProviderNotStaticModeException()
    );
  }

  private get isShiftMode() {
    const is = this._operationMode === OperationModeSchema.enum.SHIFT;
    return Guard.monitor(is, is, () => new ProviderNotShiftModeException());
  }

  private get _isDeleted(): Guard<boolean> {
    return Guard.monitor(
      this.isDeleted,
      this.isDeleted,
      () => new ProviderAlreadyDeleted()
    );
  }

  private get validateIsActive(): Guard<boolean> {
    return Guard.monitor(
      this.isActive,
      this.isActive,
      () => new Error('Uzman aktif değil')
    );
  }

  // --- Factory Method ---
  public static create(props: CreateProviderProps): Provider {
    const now = DateTimeManager.create();

    const provider = new Provider({
      id: UUID.createOrGenerate(props.id).value,

      userId: UUID.create(props.userId).orThrow().value,
      clinicId: UUID.create(props.clinicId).orThrow().value,

      providerTitleId: props.providerTitleId
        ? UUID.create(props.providerTitleId).orThrow().value
        : null,

      providerSpecialtyId: props.providerSpecialtyId
        ? UUID.create(props.providerSpecialtyId).orThrow().value
        : null,

      publicPhone: props.publicPhone
        ? Phone.create(props.publicPhone).orThrow().value
        : null,

      publicEmail: props.publicEmail
        ? Email.create(props.publicEmail).orThrow().value
        : null,

      diplomaNo: null,

      hlrNo: null,
      isActive: props.isActive ?? true,
      acceptsConsultation: props.acceptsConsultation,
      operationMode: props.operationMode,
      sectorId: props.sectorId
        ? UUID.create(props.sectorId).orThrow().value
        : null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    });

    provider.addDomainEvent(
      new ProviderCreatedEvent({
        providerId: provider.id.value,
        clinicId: provider.clinicId.value,
        userId: provider.userId.value,
      })
    );
    return provider;
  }

  // --- Business / State Mutation Methods ---
  public updateInfo(dto: UpdateProviderInfo): void {
    if (isNotUndefined(dto.providerTitleId))
      this._providerTitleId = dto.providerTitleId
        ? UUID.create(dto.providerTitleId).orThrow()
        : null;

    if (isDefined(dto.providerSpecialtyId))
      this._providerSpecialtyId = UUID.create(
        dto.providerSpecialtyId
      ).orThrow();

    if (isNotUndefined(dto.sectorId))
      this._sectorId = dto.sectorId
        ? UUID.create(dto.sectorId).orThrow()
        : null;

    if (isNotUndefined(dto.publicPhone))
      this._publicPhone = dto.publicPhone
        ? Phone.create(dto.publicPhone).orThrow()
        : null;

    if (isNotUndefined(dto.publicEmail))
      this._publicEmail = dto.publicEmail
        ? Email.create(dto.publicEmail).orThrow()
        : null;
  }

  public activate(): void {
    this._isActive = true;
  }

  public deactivate(): void {
    this._isActive = false;
  }

  public setConsultationAcceptance(value: boolean): void {
    this._acceptsConsultation = value;
  }

  public setOperationMode(mode: OperationMode): void {
    this._operationMode = mode;
  }

  public softDelete(): void {
    if (this.isDeleted) {
      throw new ProviderAlreadyDeleted();
    }
    this._deletedAt = DateTimeManager.create();
    this._isActive = false;
    this.addDomainEvent(
      new ProviderSoftDeletedEvent({
        providerId: this.id.value,
        clinicId: this.clinicId.value,
        userId: this.userId.value,
      })
    );
  }

  public canWorkAt(): boolean {
    return this._isActive && !this.isDeleted;
  }

  public switchOperationMode(): void {
    const { STATIC, SHIFT } = OperationModeSchema.enum;
    this._operationMode = this.isStaticMode ? SHIFT : STATIC;
  }

  // --- Mapping ---
  public toPersistence(): IProvider {
    return {
      id: this.id.value,
      providerTitleId: this.providerTitleId?.value ?? null,
      providerSpecialtyId: this.providerSpecialtyId?.value ?? null,
      publicPhone: this.publicPhone?.value ?? null,
      publicEmail: this.publicEmail?.value ?? null,
      diplomaNo: this.diplomaNo,
      hlrNo: this.hlrNo,
      isActive: this.isActive,
      acceptsConsultation: this.acceptsConsultation,
      operationMode: this.operationMode,
      clinicId: this.clinicId.value,
      userId: this.userId.value,
      sectorId: this.sectorId?.value ?? null,
      createdAt: this.createdAt,
      updatedAt: DateTimeManager.create(),
      deletedAt: this.deletedAt,
    };
  }

  private canAcceptConsultation(): Guard<boolean> {
    return Guard.monitor(
      this.acceptsConsultation,
      this.acceptsConsultation,
      () => new ProviderNotAcceptingExaminationException()
    );
  }
}
