import {
  MetaAdAccount,
  MetaCampaignMetric as IMetaCampaignMetric,
} from '@shared';
import { Decimal } from 'decimal.js';
import { Money } from '@src/domain/value-objects/money.vo';
import { AggregateRoot } from '@common/domain/aggregate-root';
import { Currency } from '@src/domain/value-objects/currency.vo';
import { UUID } from '@src/domain/value-objects/uuid.vo';

export class MetaCampaignMetric extends AggregateRoot {
  constructor(data: IMetaCampaignMetric) {
    super();

    const { value: currencyStr } = Currency.create(data.currency).orThrow();

    this._id = UUID.fromTrusted(data.id);
    this._metaAdAccountId = data.metaAdAccountId;
    this._campaignId = data.campaignId;
    this._campaignName = data.campaignName;
    this._date = data.date;

    this._spend = Money.create(data.spend, currencyStr).orThrow();
    this._cpc = Money.create(data.cpc, currencyStr).instance ?? null;

    this._clicks = data.clicks;
    this._impressions = data.impressions;
    this._ctr = data.ctr ? new Decimal(data.ctr) : null;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
  }

  private _id: UUID;
  get id(): UUID {
    return this._id;
  }

  private _metaAdAccountId: string;
  get metaAdAccountId(): string {
    return this._metaAdAccountId;
  }

  private _campaignId: string;
  get campaignId(): string {
    return this._campaignId;
  }

  private _campaignName: string;
  get campaignName(): string {
    return this._campaignName;
  }

  private _date: Date;
  get date(): Date {
    return this._date;
  }

  private _spend: Money;
  get spend(): Money {
    return this._spend;
  }

  private _clicks: number;
  get clicks(): number {
    return this._clicks;
  }

  private _impressions: number;
  get impressions(): number {
    return this._impressions;
  }

  private _cpc: Money | null;
  get cpc(): Money | null {
    return this._cpc;
  }

  private _ctr: Decimal | null;
  get ctr(): Decimal | null {
    return this._ctr;
  }

  // Bağımsız currency alanını sildik, ana doğruluk kaynağı olan spend nesnesine soruyoruz
  get currency(): string {
    return this._spend.currency;
  }

  private _createdAt: Date;
  get createdAt(): Date {
    return this._createdAt;
  }

  private _updatedAt: Date;
  get updatedAt(): Date {
    return this._updatedAt;
  }

  // Prisma relation stub
  get metaAdAccount(): MetaAdAccount {
    return {} as MetaAdAccount;
  }

  // TODO: static create methodu oluştur
  public toPersistence(): IMetaCampaignMetric {
    return {
      id: this.id.value,
      metaAdAccountId: this.metaAdAccountId,
      campaignId: this.campaignId,
      campaignName: this.campaignName,
      date: this.date,

      spend: this.spend.value,
      cpc: this.cpc?.value ?? null,
      ctr: this.ctr,

      clicks: this.clicks,
      impressions: this.impressions,

      currency: this.spend.currency,

      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
