import { Provider as IProvider } from '@model-schema/ProviderSchema';
import {
  OperationModeSchema,
  OperationModeType as OperationMode,
} from '@input-type-schemas/OperationModeSchema';
import { AggregateRoot } from '@common/domain/aggregate-root';
import { CreateProviderProps } from '@modules/clinical/provider/domain/types/create-provider.props';
import { ProviderCreatedEvent } from '@modules/clinical/provider/domain/events/provider-created.event';
import { ProviderSoftDeletedEvent } from '@modules/clinical/provider/domain/events/provider-soft-deleted.event';
import { UpdateProviderInfo } from '@shared/modules/provider/types/update-provider-info.type';

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
    this._canAcceptExamination = data.canAcceptExamination;
    this._operationMode = data.operationMode;
    this._clinicId = data.clinicId;
    this._userId = data.userId;
    this._sectorId = data.sectorId;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
    this._deletedAt = data.deletedAt;
  }

  private _id: string;
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

  private _canAcceptExamination: boolean;
  get canAcceptExamination(): boolean {
    return this._canAcceptExamination;
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

  public static create(props: CreateProviderProps): Provider {
    const now = new Date();
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
      canAcceptExamination: false,
      operationMode: props.operationMode ?? OperationModeSchema.enum.STATIC,
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

  public setExaminationCapability(value: boolean): void {
    this._canAcceptExamination = value;
  }

  public setOperationMode(mode: OperationMode): void {
    this._operationMode = mode;
  }

  public softDelete(): void {
    if (this.isDeleted) {
      throw new Error('Uzman zaten silinmiş.');
    }
    this._deletedAt = new Date();
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

  public isShiftMode(): boolean {
    return this._operationMode === OperationModeSchema.enum.SHIFT;
  }

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
      canAcceptExamination: this._canAcceptExamination,
      operationMode: this._operationMode,
      clinicId: this._clinicId,
      userId: this._userId,
      sectorId: this._sectorId,
      createdAt: this._createdAt,
      updatedAt: new Date(),
      deletedAt: this._deletedAt,
    };
  }
}
