import { MetaAdAccount as IMetaAdAccount } from '@shared';
import { AggregateRoot } from '@common/domain/aggregate-root';
import { DateTimeManager } from '@common/infrastructure/date-time/date-time.manager';
import { Guard } from '@common/domain/guards';
import { UUID } from '@src/domain/value-objects/uuid.vo';
import { Name } from '@src/domain/value-objects/name.vo';

const TOKEN_EXPIRY_WARNING_DAYS = 7;

export class MetaAdAccount extends AggregateRoot {
  constructor(data: IMetaAdAccount) {
    super();
    this._id = UUID.fromTrusted(data.id);
    this._clinicId = UUID.fromTrusted(data.clinicId);
    this._adAccountId = data.adAccountId;
    this._accessToken = data.accessToken;
    this._pageId = data.pageId;
    this._businessName = data.businessName
      ? Name.create(data.businessName).value
      : null;
    this._isActive = data.isActive;
    this._tokenExpiresAt = data.tokenExpiresAt;
    this._lastSyncAt = data.lastSyncAt;
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

  private _adAccountId: string;
  get adAccountId(): string {
    return this._adAccountId;
  }

  private _accessToken: string;
  get accessToken(): string {
    return this._accessToken;
  }

  private _pageId: string | null;
  get pageId(): string | null {
    return this._pageId;
  }

  private _businessName: Name | null;
  get businessName(): Name | null {
    return this._businessName;
  }

  private _isActive: boolean;
  get isActive(): boolean {
    return this._isActive;
  }

  private _tokenExpiresAt: Date | null;
  get tokenExpiresAt(): Date | null {
    return this._tokenExpiresAt;
  }

  private _lastSyncAt: Date | null;
  get lastSyncAt(): Date | null {
    return this._lastSyncAt;
  }

  private _createdAt: Date;
  get createdAt(): Date {
    return this._createdAt;
  }

  private _updatedAt: Date;
  get updatedAt(): Date {
    return this._updatedAt;
  }

  public get validate() {
    return {
      tokenExpiringSoon: () => {
        const isExpiringSoon = this.isTokenExpiringSoon();

        return Guard.monitor(
          isExpiringSoon,
          isExpiringSoon,
          new Error('Token süresi yakında doluyor')
        );
      },
    };
  }

  public deactivate(): void {
    this._isActive = false;
  }

  public markSynced(): void {
    this._lastSyncAt = DateTimeManager.create();
  }

  public refreshToken(accessToken: string, expiresAt: Date | null): void {
    this._accessToken = accessToken;
    this._tokenExpiresAt = expiresAt;
  }

  public toPersistence(): IMetaAdAccount {
    return {
      id: this._id.value,
      clinicId: this._clinicId.value,
      adAccountId: this._adAccountId,
      accessToken: this._accessToken,
      pageId: this._pageId,
      businessName: this._businessName?.value ?? null,
      isActive: this._isActive,
      tokenExpiresAt: this._tokenExpiresAt,
      lastSyncAt: this._lastSyncAt,
      createdAt: this._createdAt,
      updatedAt: DateTimeManager.create(),
    };
  }

  private isTokenExpiringSoon(): boolean {
    if (!this._tokenExpiresAt) return false;
    const threshold = DateTimeManager.create();
    threshold.setDate(threshold.getDate() + TOKEN_EXPIRY_WARNING_DAYS);
    return this._tokenExpiresAt <= threshold;
  }
}
