import { Provider as IProvider } from '@model-schema/ProviderSchema';
import {
  OperationModeSchema,
  OperationModeType as OperationMode,
} from '@input-type-schemas/OperationModeSchema';
import { AggregateRoot } from '@common/domain/aggregate-root';

import { ProviderCreatedEvent } from '@modules/clinical/provider/domain/events/provider-created.event';
import { ProviderSoftDeletedEvent } from '@modules/clinical/provider/domain/events/provider-soft-deleted.event';
import { UpdateProviderInfo } from '@shared/modules/provider/types/update-provider-info.type';
import { CreateProviderProps } from '@modules/clinical/provider/domain/contracts/provider.contracts';
import {
  ProviderAlreadyDeleted,
  ProviderNotAcceptingExaminationException,
  ProviderNotShiftModeException,
  ProviderNotStaticModeException,
} from '@modules/clinical/provider/domain/exceptions/provider.exceptions';
import { Guard } from '@common/domain/guards';
import { DateTimeManager } from '@common/utils';

export class Provider extends AggregateRoot {
  constructor(data: IProvider) {
    super();
    this._id = data.id;
    this._providerTitleId = data.providerTitleId;
    this._providerSpecialtyId = data.providerSpecialtyId;
    this._publicPhone = data.publicPhone;
    this._publicEmail = data.publicEmail;
    this._diplomaNo = data.diplomaNo;
    this._hlrNo = data.hlrNo;
    this._isActive = data.isActive;
    this._operationMode = data.operationMode;
    this._clinicId = data.clinicId;
    this._userId = data.userId;
    this._sectorId = data.sectorId;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
    this._deletedAt = data.deletedAt;
    this._acceptsConsultation = data.acceptsConsultation;
  }

  private _acceptsConsultation: boolean;

  get acceptsConsultation(): boolean {
    return this._acceptsConsultation;
  }

  private _id: string;

  // --- Getters ---
  get id(): string {
    return this._id;
  }

  private _providerTitleId: string | null;

  get providerTitleId(): string | null {
    return this._providerTitleId;
  }

  private _providerSpecialtyId: string | null;

  get providerSpecialtyId(): string | null {
    return this._providerSpecialtyId;
  }

  private _publicPhone: string | null;

  get publicPhone(): string | null {
    return this._publicPhone;
  }

  private _publicEmail: string | null;

  get publicEmail(): string | null {
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

  private _clinicId: string;

  get clinicId(): string {
    return this._clinicId;
  }

  private _userId: string;

  get userId(): string {
    return this._userId;
  }

  private _sectorId: string | null;

  get sectorId(): string | null {
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
      isStaticMode: this.validateStaticMode(),
      isShiftMode: this.validateShiftMode(),
      canAcceptConsultation: this.canAcceptConsultation(),
      isDeleted: this.validateIsDeleted(),
      isActive: this.validateIsActive(),
    };
  }

  // --- Factory Method ---
  public static create(props: CreateProviderProps): Provider {
    const now = DateTimeManager.create(); // 2026 Güvenli tarih standardımız
    const provider = new Provider({
      id: props.id,
      userId: props.userId,
      clinicId: props.clinicId,
      providerTitleId: props.providerTitleId ?? null,
      providerSpecialtyId: props.providerSpecialtyId ?? null,
      publicPhone: props.publicPhone ?? null,
      publicEmail: props.publicEmail ?? null,
      diplomaNo: null,
      hlrNo: null,
      isActive: props.isActive ?? true,
      acceptsConsultation: props.acceptsConsultation,
      operationMode: props.operationMode,
      sectorId: props.sectorId ?? null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    });

    provider.addDomainEvent(
      new ProviderCreatedEvent({
        providerId: provider.id,
        clinicId: provider.clinicId,
        userId: provider.userId,
      })
    );
    return provider;
  }

  // --- Business / State Mutation Methods ---
  public updateInfo(dto: UpdateProviderInfo): void {
    if (dto.providerTitleId !== undefined)
      this._providerTitleId = dto.providerTitleId;
    if (dto.providerSpecialtyId !== undefined)
      this._providerSpecialtyId = dto.providerSpecialtyId;
    if (dto.sectorId !== undefined) this._sectorId = dto.sectorId;
    if (dto.publicPhone !== undefined) this._publicPhone = dto.publicPhone;
    if (dto.publicEmail !== undefined) this._publicEmail = dto.publicEmail;
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
        providerId: this._id,
        clinicId: this._clinicId,
        userId: this._userId,
      })
    );
  }

  public canWorkAt(): boolean {
    return this._isActive && !this.isDeleted;
  }

  public isStaticMode(): boolean {
    return this._operationMode === OperationModeSchema.enum.STATIC;
  }

  public switchOperationMode(): void {
    const { STATIC, SHIFT } = OperationModeSchema.enum;
    this._operationMode = this.isStaticMode() ? SHIFT : STATIC;
  }

  public isShiftMode(): boolean {
    return this._operationMode === OperationModeSchema.enum.SHIFT;
  }

  // --- Mapping ---
  public toPersistence(): IProvider {
    return {
      id: this._id,
      providerTitleId: this._providerTitleId,
      providerSpecialtyId: this._providerSpecialtyId,
      publicPhone: this._publicPhone,
      publicEmail: this._publicEmail,
      diplomaNo: this._diplomaNo,
      hlrNo: this._hlrNo,
      isActive: this._isActive,
      acceptsConsultation: this._acceptsConsultation,
      operationMode: this._operationMode,
      clinicId: this._clinicId,
      userId: this._userId,
      sectorId: this._sectorId,
      createdAt: this._createdAt,
      updatedAt: DateTimeManager.create(),
      deletedAt: this._deletedAt,
    };
  }

  private validateIsDeleted(): Guard<boolean> {
    return Guard.monitor(
      this.isDeleted,
      this.isDeleted,
      new ProviderAlreadyDeleted()
    );
  }

  private validateIsActive(): Guard<boolean> {
    return Guard.monitor(
      this.isActive,
      this.isActive,
      new Error('Uzman aktif değil')
    );
  }

  private validateShiftMode(): Guard<boolean> {
    return Guard.monitor(
      this.isShiftMode(),
      this.isShiftMode(),
      new ProviderNotShiftModeException()
    );
  }

  private validateStaticMode(): Guard<boolean> {
    return Guard.monitor(
      this.isStaticMode(),
      this.isStaticMode(),
      new ProviderNotStaticModeException()
    );
  }

  private canAcceptConsultation(): Guard<boolean> {
    return Guard.monitor(
      this._acceptsConsultation,
      this._acceptsConsultation,
      new ProviderNotAcceptingExaminationException()
    );
  }
}
