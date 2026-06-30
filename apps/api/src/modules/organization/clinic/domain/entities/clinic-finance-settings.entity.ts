import { randomUUID } from 'crypto';
import { Prisma } from '@prisma/client';
import { ClinicFinanceSettings as IClinicFinanceSettings } from '@shared';
import { Currency } from '@src/domain/value-objects/currency.vo';
import { DateTimeManager } from '@common/infrastructure/date-time/date-time.manager';
import { CreateClinicFinanceSettingsProps } from '@modules/organization/clinic/domain/contracts/clinic-finance-settings.contracts';

/**
 * Kliniğin finansal davranış ayarları (1:1 satellite). `defaultCurrency` defterin
 * fonksiyonel para birimidir — muhasebe raporları ve posting bu birim üzerinden çalışır.
 */
export class ClinicFinanceSettings {
  constructor(data: IClinicFinanceSettings) {
    this._id = data.id;
    this._clinicId = data.clinicId;
    this._defaultCurrency = Currency.create(data.defaultCurrency).orThrow();
    this._autoCreateInvoice = data.autoCreateInvoice;
    this._defaultVatRate = data.defaultVatRate;
    this._useCostTracking = data.useCostTracking;
    this._allowNegativeBalance = data.allowNegativeBalance;
    this._maxInstallmentCount = data.maxInstallmentCount;
    this._fiscalYearStartMonth = data.fiscalYearStartMonth;
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

  private _defaultCurrency: Currency;
  get defaultCurrency(): Currency {
    return this._defaultCurrency;
  }

  private _autoCreateInvoice: boolean;
  get autoCreateInvoice(): boolean {
    return this._autoCreateInvoice;
  }

  private _defaultVatRate: Prisma.Decimal;
  get defaultVatRate(): Prisma.Decimal {
    return this._defaultVatRate;
  }

  private _useCostTracking: boolean;
  get useCostTracking(): boolean {
    return this._useCostTracking;
  }

  private _allowNegativeBalance: boolean;
  get allowNegativeBalance(): boolean {
    return this._allowNegativeBalance;
  }

  private _maxInstallmentCount: number;
  get maxInstallmentCount(): number {
    return this._maxInstallmentCount;
  }

  private _fiscalYearStartMonth: number;
  get fiscalYearStartMonth(): number {
    return this._fiscalYearStartMonth;
  }

  private _updatedAt: Date;
  get updatedAt(): Date {
    return this._updatedAt;
  }

  /** Klinik için DB default'larıyla birebir varsayılan finans ayarları. */
  public static createDefault(clinicId: string): ClinicFinanceSettings {
    return ClinicFinanceSettings.create({ clinicId });
  }

  public static create(
    props: CreateClinicFinanceSettingsProps
  ): ClinicFinanceSettings {
    return new ClinicFinanceSettings({
      id: props.id ?? randomUUID(),
      clinicId: props.clinicId,
      defaultCurrency: props.defaultCurrency ?? Currency.enum.TRY,
      autoCreateInvoice: props.autoCreateInvoice ?? true,
      defaultVatRate: props.defaultVatRate ?? new Prisma.Decimal(20),
      useCostTracking: props.useCostTracking ?? true,
      allowNegativeBalance: props.allowNegativeBalance ?? false,
      maxInstallmentCount: props.maxInstallmentCount ?? 12,
      fiscalYearStartMonth: props.fiscalYearStartMonth ?? 1,
      updatedAt: DateTimeManager.create(),
    });
  }

  toPersistence(): IClinicFinanceSettings {
    return {
      id: this._id,
      clinicId: this._clinicId,
      defaultCurrency: this._defaultCurrency.value,
      autoCreateInvoice: this._autoCreateInvoice,
      defaultVatRate: this._defaultVatRate,
      useCostTracking: this._useCostTracking,
      allowNegativeBalance: this._allowNegativeBalance,
      maxInstallmentCount: this._maxInstallmentCount,
      fiscalYearStartMonth: this._fiscalYearStartMonth,
      updatedAt: this._updatedAt,
    };
  }
}
