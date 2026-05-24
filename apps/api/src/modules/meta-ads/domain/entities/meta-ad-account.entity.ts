import {
  MetaAdAccount as IMetaAdAccount,
  MetaCampaignMetric,
  MetaLead,
} from '@prisma/client';
import { AggregateRoot } from '@common/domain/aggregate-root';

export class MetaAdAccount
  extends AggregateRoot
  implements IMetaAdAccount
{
  constructor(data: IMetaAdAccount) {
    super();
    this._id = data.id;
    this._clinicId = data.clinicId;
    this._adAccountId = data.adAccountId;
    this._accessToken = data.accessToken;
    this._pageId = data.pageId;
    this._businessName = data.businessName;
    this._isActive = data.isActive;
    this._lastSyncAt = data.lastSyncAt;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
  }

  private _id: string;
  get id(): string { return this._id; }

  private _clinicId: string;
  get clinicId(): string { return this._clinicId; }

  private _adAccountId: string;
  get adAccountId(): string { return this._adAccountId; }

  private _accessToken: string;
  get accessToken(): string { return this._accessToken; }

  private _pageId: string | null;
  get pageId(): string | null { return this._pageId; }

  private _businessName: string | null;
  get businessName(): string | null { return this._businessName; }

  private _isActive: boolean;
  get isActive(): boolean { return this._isActive; }

  private _lastSyncAt: Date | null;
  get lastSyncAt(): Date | null { return this._lastSyncAt; }

  private _createdAt: Date;
  get createdAt(): Date { return this._createdAt; }

  private _updatedAt: Date;
  get updatedAt(): Date { return this._updatedAt; }

  // Prisma relation stubs — never populated from domain
  get leads(): MetaLead[] { return []; }
  get metrics(): MetaCampaignMetric[] { return []; }

  public deactivate(): void {
    this._isActive = false;
  }

  public markSynced(): void {
    this._lastSyncAt = new Date();
  }

  public toPersistence(): IMetaAdAccount {
    return {
      id: this._id,
      clinicId: this._clinicId,
      adAccountId: this._adAccountId,
      accessToken: this._accessToken,
      pageId: this._pageId,
      businessName: this._businessName,
      isActive: this._isActive,
      lastSyncAt: this._lastSyncAt,
      createdAt: this._createdAt,
      updatedAt: new Date(),
    };
  }
}
