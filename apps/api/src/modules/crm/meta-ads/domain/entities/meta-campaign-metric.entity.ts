import {
  MetaCampaignMetric as IMetaCampaignMetric,
  MetaAdAccount,
} from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export class MetaCampaignMetric implements IMetaCampaignMetric {
  constructor(data: IMetaCampaignMetric) {
    this._id = data.id;
    this._metaAdAccountId = data.metaAdAccountId;
    this._campaignId = data.campaignId;
    this._campaignName = data.campaignName;
    this._date = data.date;
    this._spend = data.spend;
    this._clicks = data.clicks;
    this._impressions = data.impressions;
    this._cpc = data.cpc;
    this._ctr = data.ctr;
    this._currency = data.currency;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
  }

  private _id: string;
  get id(): string { return this._id; }

  private _metaAdAccountId: string;
  get metaAdAccountId(): string { return this._metaAdAccountId; }

  private _campaignId: string;
  get campaignId(): string { return this._campaignId; }

  private _campaignName: string;
  get campaignName(): string { return this._campaignName; }

  private _date: Date;
  get date(): Date { return this._date; }

  private _spend: Decimal;
  get spend(): Decimal { return this._spend; }

  private _clicks: number;
  get clicks(): number { return this._clicks; }

  private _impressions: number;
  get impressions(): number { return this._impressions; }

  private _cpc: Decimal | null;
  get cpc(): Decimal | null { return this._cpc; }

  private _ctr: Decimal | null;
  get ctr(): Decimal | null { return this._ctr; }

  private _currency: string;
  get currency(): string { return this._currency; }

  private _createdAt: Date;
  get createdAt(): Date { return this._createdAt; }

  private _updatedAt: Date;
  get updatedAt(): Date { return this._updatedAt; }

  // Prisma relation stub
  get metaAdAccount(): MetaAdAccount { return {} as MetaAdAccount; }

  public toPersistence(): IMetaCampaignMetric {
    return {
      id: this._id,
      metaAdAccountId: this._metaAdAccountId,
      campaignId: this._campaignId,
      campaignName: this._campaignName,
      date: this._date,
      spend: this._spend,
      clicks: this._clicks,
      impressions: this._impressions,
      cpc: this._cpc,
      ctr: this._ctr,
      currency: this._currency,
      createdAt: this._createdAt,
      updatedAt: new Date(),
    };
  }
}
