import { PosDevice as IPosDevice } from '@prisma/client';
import { AggregateRoot } from '@common/domain/aggregate-root';
import { randomUUID } from 'crypto';
import PosProviderSchema, {
  PosProviderType as PosProvider,
} from '@input-type-schemas/PosProviderSchema';
import {
  CreatePosDeviceProps,
  PaxConnection,
} from '@modules/finance/pos/physical/domain/pos-physical.contracts';
import {
  PosDeviceMissingDeviceUniqueIdException,
  PosDeviceProviderMismatchException,
} from '@modules/finance/pos/physical/domain/exceptions/pos.exceptions';

export class PosDevice extends AggregateRoot implements IPosDevice {
  constructor(data: IPosDevice) {
    super();
    this._id = data.id;
    this._clinicId = data.clinicId;
    this._label = data.label;
    this._provider = data.provider;
    this._terminalId = data.terminalId;
    this._merchantId = data.merchantId;
    this._host = data.host;
    this._port = data.port;
    this._deviceUniqueId = data.deviceUniqueId;
    this._isActive = data.isActive;
    this._isDeleted = data.isDeleted;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
  }

  private _id: string;
  get id(): string {
    return this._id;
  }

  private _clinicId: string;
  get clinicId(): string {
    return this._clinicId;
  }

  private _label: string;
  get label(): string {
    return this._label;
  }

  private _provider: PosProvider;
  get provider(): PosProvider {
    return this._provider;
  }

  private _terminalId: string | null;
  get terminalId(): string | null {
    return this._terminalId;
  }

  private _merchantId: string | null;
  get merchantId(): string | null {
    return this._merchantId;
  }

  private _host: string | null;
  get host(): string | null {
    return this._host;
  }

  private _port: number | null;
  get port(): number | null {
    return this._port;
  }

  private _deviceUniqueId: string | null;
  get deviceUniqueId(): string | null {
    return this._deviceUniqueId;
  }

  private _isActive: boolean;
  get isActive(): boolean {
    return this._isActive;
  }

  private _isDeleted: boolean;
  get isDeleted(): boolean {
    return this._isDeleted;
  }

  private _createdAt: Date;
  get createdAt(): Date {
    return this._createdAt;
  }

  private _updatedAt: Date;
  get updatedAt(): Date {
    return this._updatedAt;
  }

  public static create(props: CreatePosDeviceProps): PosDevice {
    const now = new Date();
    const provider = props.provider ?? PosProviderSchema.enum.PAX;
    return new PosDevice({
      id: props.id ?? randomUUID(),
      clinicId: props.clinicId,
      label: props.label,
      provider,
      terminalId: props.terminalId ?? null,
      merchantId: props.merchantId ?? null,
      host: props.host ?? null,
      port: props.port ?? null,
      deviceUniqueId: props.deviceUniqueId ?? null,
      isActive: true,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    });
  }

  public isPax(): boolean {
    return this._provider === PosProviderSchema.enum.PAX;
  }

  public isIyzicoTerminal(): boolean {
    return this._provider === PosProviderSchema.enum.IYZICO_TERMINAL;
  }

  /**
   * PAX TCP bağlantı bilgisini null-güvenli döner. Cihaz PAX değilse veya
   * bağlantı alanları eksikse domain hatası fırlatır.
   */
  public getPaxConnection(): PaxConnection {
    if (!this.isPax()) {
      throw new PosDeviceProviderMismatchException(
        PosProviderSchema.enum.PAX,
        this._provider
      );
    }
    if (
      this._host === null ||
      this._port === null ||
      this._terminalId === null ||
      this._merchantId === null
    ) {
      throw new PosDeviceProviderMismatchException(
        PosProviderSchema.enum.PAX,
        this._provider,
        'PAX cihazı için host, port, terminalId ve merchantId zorunludur.'
      );
    }
    return {
      host: this._host,
      port: this._port,
      terminalId: this._terminalId,
      merchantId: this._merchantId,
    };
  }

  /**
   * iyzico Terminal cihaz benzersiz kimliğini null-güvenli döner. Cihaz iyzico
   * terminal değilse veya deviceUniqueId yoksa domain hatası fırlatır.
   */
  public getIyzicoDeviceUniqueId(): string {
    if (!this.isIyzicoTerminal()) {
      throw new PosDeviceProviderMismatchException(
        PosProviderSchema.enum.IYZICO_TERMINAL,
        this._provider
      );
    }
    if (this._deviceUniqueId === null) {
      throw new PosDeviceMissingDeviceUniqueIdException();
    }
    return this._deviceUniqueId;
  }

  public deactivate(): void {
    this._isActive = false;
    this._updatedAt = new Date();
  }

  public softDelete(): void {
    this._isActive = false;
    this._isDeleted = true;
    this._updatedAt = new Date();
  }

  public toPersistence(): IPosDevice {
    return {
      id: this._id,
      clinicId: this._clinicId,
      label: this._label,
      provider: this._provider,
      terminalId: this._terminalId,
      merchantId: this._merchantId,
      host: this._host,
      port: this._port,
      deviceUniqueId: this._deviceUniqueId,
      isActive: this._isActive,
      isDeleted: this._isDeleted,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
