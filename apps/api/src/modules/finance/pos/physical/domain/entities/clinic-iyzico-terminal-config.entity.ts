import { ClinicIyzicoTerminalConfig as IClinicIyzicoTerminalConfig } from '@shared';
import { AggregateRoot } from '@common/domain/aggregate-root';
import { CreateClinicIyzicoTerminalConfigProps } from '@modules/finance/pos/physical/domain/pos-physical.contracts';

/**
 * Kliniğin iyzico Terminal (Host API) merchant kimliklerini barındıran 1:1
 * satellite. Sırlar klinik başına tek yerde yaşar; POS cihazları yalnızca
 * deviceUniqueId taşır, kimlik bilgilerini bu config sağlar.
 */
export class ClinicIyzicoTerminalConfig
  extends AggregateRoot
  implements IClinicIyzicoTerminalConfig
{
  constructor(data: IClinicIyzicoTerminalConfig) {
    super();
    this._id = data.id;
    this._clientId = data.clientId;
    this._clientSecret = data.clientSecret;
    this._username = data.username;
    this._password = data.password;
    this._clinicId = data.clinicId;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
  }

  private _id: string;
  get id(): string {
    return this._id;
  }

  private _clientId: string;
  get clientId(): string {
    return this._clientId;
  }

  private _clientSecret: string;
  get clientSecret(): string {
    return this._clientSecret;
  }

  private _username: string;
  get username(): string {
    return this._username;
  }

  private _password: string;
  get password(): string {
    return this._password;
  }

  private _clinicId: string;
  get clinicId(): string {
    return this._clinicId;
  }

  private _createdAt: Date;
  get createdAt(): Date {
    return this._createdAt;
  }

  private _updatedAt: Date;
  get updatedAt(): Date {
    return this._updatedAt;
  }

  public static create(
    props: CreateClinicIyzicoTerminalConfigProps
  ): ClinicIyzicoTerminalConfig {
    const now = new Date();
    return new ClinicIyzicoTerminalConfig({
      id: props.id ?? crypto.randomUUID(),
      clinicId: props.clinicId,
      clientId: props.clientId,
      clientSecret: props.clientSecret,
      username: props.username,
      password: props.password,
      createdAt: now,
      updatedAt: now,
    });
  }

  /** Merchant kimliklerini günceller (yeniden kayıt akışı). */
  public updateCredentials(
    props: Omit<CreateClinicIyzicoTerminalConfigProps, 'id' | 'clinicId'>
  ): void {
    this._clientId = props.clientId;
    this._clientSecret = props.clientSecret;
    this._username = props.username;
    this._password = props.password;
    this._updatedAt = new Date();
  }

  public toPersistence(): IClinicIyzicoTerminalConfig {
    return {
      id: this._id,
      clientId: this._clientId,
      clientSecret: this._clientSecret,
      username: this._username,
      password: this._password,
      clinicId: this._clinicId,
      createdAt: this._createdAt,
      updatedAt: new Date(),
    };
  }
}
