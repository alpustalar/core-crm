import { ClinicWhatsappChannel as IClinicWhatsappChannel } from '@shared/generated-zod';
import { AggregateRoot } from '@common/domain/aggregate-root';
import { CreateClinicWhatsappChannelProps } from '../types/create-clinic-whatsapp-channel.props';

/**
 * Kliniğin WhatsApp Business kanal config'i (messaging bounded-context). Clinic'ten
 * ayrıştırılmış 1:1 satellite; Meta phone_number_id + (şifreli) credential'ları barındırır.
 * Webhook gelen olayları phoneNumberId ile bu kayda routing eder.
 */
export class ClinicWhatsappChannel
  extends AggregateRoot
  implements IClinicWhatsappChannel
{
  constructor(data: IClinicWhatsappChannel) {
    super();
    this._id = data.id;
    this._phoneNumberId = data.phoneNumberId;
    this._wabaId = data.wabaId;
    this._displayPhoneNumber = data.displayPhoneNumber;
    this._accessToken = data.accessToken;
    this._verifyToken = data.verifyToken;
    this._isActive = data.isActive;
    this._clinicId = data.clinicId;
    this._organizationId = data.organizationId;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
  }

  private _id: string;
  get id(): string {
    return this._id;
  }

  private _phoneNumberId: string;
  get phoneNumberId(): string {
    return this._phoneNumberId;
  }

  private _wabaId: string | null;
  get wabaId(): string | null {
    return this._wabaId;
  }

  private _displayPhoneNumber: string | null;
  get displayPhoneNumber(): string | null {
    return this._displayPhoneNumber;
  }

  private _accessToken: string | null;
  get accessToken(): string | null {
    return this._accessToken;
  }

  private _verifyToken: string | null;
  get verifyToken(): string | null {
    return this._verifyToken;
  }

  private _isActive: boolean;
  get isActive(): boolean {
    return this._isActive;
  }

  private _clinicId: string;
  get clinicId(): string {
    return this._clinicId;
  }

  private _organizationId: string;
  get organizationId(): string {
    return this._organizationId;
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
    props: CreateClinicWhatsappChannelProps
  ): ClinicWhatsappChannel {
    const now = new Date();
    return new ClinicWhatsappChannel({
      id: props.id ?? crypto.randomUUID(),
      clinicId: props.clinicId,
      organizationId: props.organizationId,
      phoneNumberId: props.phoneNumberId,
      wabaId: props.wabaId ?? null,
      displayPhoneNumber: props.displayPhoneNumber ?? null,
      accessToken: props.accessToken ?? null,
      verifyToken: props.verifyToken ?? null,
      isActive: props.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    });
  }

  public deactivate(): void {
    this._isActive = false;
  }

  public toPersistence(): IClinicWhatsappChannel {
    return {
      id: this._id,
      phoneNumberId: this._phoneNumberId,
      wabaId: this._wabaId,
      displayPhoneNumber: this._displayPhoneNumber,
      accessToken: this._accessToken,
      verifyToken: this._verifyToken,
      isActive: this._isActive,
      clinicId: this._clinicId,
      organizationId: this._organizationId,
      createdAt: this._createdAt,
      updatedAt: new Date(),
    };
  }
}
