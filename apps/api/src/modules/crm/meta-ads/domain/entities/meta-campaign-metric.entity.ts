import {
  MetaAdAccount,
  MetaCampaignMetric as IMetaCampaignMetric,
} from '@shared';
import { Decimal } from 'decimal.js';
import { Money } from '@src/domain/value-objects/money.vo'; // Money VO entegre edildi
import { AggregateRoot } from '@common/domain/aggregate-root';
import { Currency } from '@src/domain/value-objects/currency.vo';

export class MetaCampaignMetric extends AggregateRoot {
  // Constructor imzasını 'any' veya gevşek tipe çekerek Prisma katılıklarını domainden uzak tutuyoruz
  constructor(data: IMetaCampaignMetric) {
    super();

    const { value: currencyStr } = Currency.create(data.currency).orThrow();

    this._id = data.id;
    this._metaAdAccountId = data.metaAdAccountId;
    this._campaignId = data.campaignId;
    this._campaignName = data.campaignName;
    this._date = data.date;

    this._spend = Money.create(data.spend, currencyStr).orThrow();
    this._cpc = Money.create(data.cpc, currencyStr).instance ?? null;

    this._clicks = data.clicks;
    this._impressions = data.impressions;
    this._ctr = data.ctr ? new Decimal(data.ctr) : null; // CTR percentage olduğu için Decimal
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
  }

  private _id: string;
  get id(): string {
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

  public toPersistence(): IMetaCampaignMetric {
    return {
      id: this._id,
      metaAdAccountId: this._metaAdAccountId,
      campaignId: this._campaignId,
      campaignName: this._campaignName,
      date: this._date,

      spend: this._spend.amount,
      cpc: this._cpc?.amount ?? null,
      ctr: this._ctr,

      clicks: this._clicks,
      impressions: this._impressions,

      currency: this._spend.currency,

      createdAt: this._createdAt,
      updatedAt: new Date(),
    };
  }
}
