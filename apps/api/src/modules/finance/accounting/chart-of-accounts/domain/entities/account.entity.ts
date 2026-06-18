import { Account as IAccount, AccountSideSchema } from '@shared';
import { AggregateRoot } from '@common/domain/aggregate-root';
import { CreateAccountProps } from '../types/create-account.props';
import {
  AccountTemplateNode,
  CLINIC_CHART_OF_ACCOUNTS_TEMPLATE,
} from '../constants/clinic-chart-of-accounts.template';
import { AccountCode } from '@modules/finance/accounting/chart-of-accounts/domain/value-objects/account-code.vo';
import { Currency } from '@src/domain/value-objects/currency.vo';
import { AccountTypeType as AccountType } from '@input-type-schemas/AccountTypeSchema';
import { AccountSideType as AccountSide } from '@input-type-schemas/AccountSideSchema';
import { BadRequestException } from '@nestjs/common';

export interface BuildChartInput {
  clinicId: string;
  organizationId: string;
}

export class Account extends AggregateRoot {
  constructor(data: IAccount) {
    super();
    this._id = data.id;
    this._clinicId = data.clinicId;
    this._organizationId = data.organizationId;
    this._code = AccountCode.create(data.code);
    this._name = data.name;
    this._parentId = data.parentId;
    this._type = data.type;
    this._normalSide = data.normalSide;
    this._isPostable = data.isPostable;
    this._requiresParty = data.requiresParty;
    this._currency = data.currency ? Currency.create(data.currency) : null;
    this._isActive = data.isActive;
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

  private _organizationId: string;
  get organizationId(): string {
    return this._organizationId;
  }

  private _code: AccountCode;
  get code(): AccountCode {
    return this._code;
  }

  private _name: string;
  get name(): string {
    return this._name;
  }

  private _parentId: string | null;
  get parentId(): string | null {
    return this._parentId;
  }

  private _type: AccountType;
  get type(): AccountType {
    return this._type;
  }

  private _normalSide: AccountSide;
  get normalSide(): AccountSide {
    return this._normalSide;
  }

  private _isPostable: boolean;
  get isPostable(): boolean {
    return this._isPostable;
  }

  private _requiresParty: boolean;
  get requiresParty(): boolean {
    return this._requiresParty;
  }

  private _currency: Currency | null;
  get currency(): Currency | null {
    return this._currency;
  }

  private _isActive: boolean;
  get isActive(): boolean {
    return this._isActive;
  }

  private _createdAt: Date;
  get createdAt(): Date {
    return this._createdAt;
  }

  private _updatedAt: Date;
  get updatedAt(): Date {
    return this._updatedAt;
  }

  public static create(props: CreateAccountProps): Account {
    const accountCode = AccountCode.create(props.code);
    const currencyStr = props.currency
      ? Currency.create(props.currency).value
      : null;

    return new Account({
      id: props.id ?? crypto.randomUUID(),
      clinicId: props.clinicId,
      organizationId: props.organizationId,
      code: accountCode.value,
      name: props.name,
      parentId: props.parentId ?? null,
      type: props.type,
      normalSide: props.normalSide,
      isPostable: props.isPostable ?? true,
      requiresParty: props.requiresParty ?? false,
      currency: currencyStr,
      isActive: props.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * Bir şablondan tüm hesap ağacını üretir. `parentId`'ler önceden üretilen
   * UUID'ler üzerinden (code → id) çözülür; böylece tek bir bulk insert yeterli olur.
   */
  public static buildChartFromTemplate(
    input: BuildChartInput,
    template: readonly AccountTemplateNode[] = CLINIC_CHART_OF_ACCOUNTS_TEMPLATE
  ): Account[] {
    const { clinicId, organizationId } = input;
    const idByCode = new Map<string, string>();
    template.forEach((node) => idByCode.set(node.code, crypto.randomUUID()));

    return template.map((node) => {
      const parentNode = node.parentCode
        ? template.find((t) => t.code === node.parentCode)
        : null;
      if (parentNode) {
        if (
          parentNode.type !== node.type ||
          parentNode.normalSide !== node.normalSide
        ) {
          throw new Error(
            `[Şablon Hatası] ${node.code} nolu alt hesabın tipi/yönü, ` +
              `üst hesabı olan ${parentNode.code} ile uyuşmuyor!`
          );
        }
      }
      return Account.create({
        id: idByCode.get(node.code),
        clinicId,
        organizationId,
        code: node.code,
        name: node.name,
        parentId: node.parentCode
          ? (idByCode.get(node.parentCode) ?? null)
          : null,
        type: node.type,
        normalSide: node.normalSide,
        isPostable: node.isPostable,
        requiresParty: node.requiresParty ?? false,
      });
    });
  }

  public createChild(
    props: Omit<CreateAccountProps, 'parentId' | 'type' | 'normalSide'>
  ): Account {
    // İş Kuralı: Eğer bu hesaba daha önce doğrudan kayıt atılabiliyorduysa,
    // altına çocuk açıldığı an bu hesap artık "kolektif/ana" hesap olur ve doğrudan kayıt kabul etmez.
    if (this._isPostable) {
      throw new Error(
        `[Muhasebe Disiplini] Doğrudan kayıt alan (${this._code.value}) hesabın altına alt hesap açılamaz. Önce bu hesabın postable özelliğini kapatmalısınız.`
      );
    }

    return Account.create({
      ...props,
      parentId: this._id,
      clinicId: this._clinicId,
      organizationId: this._organizationId,
      type: this._type, // Ana hesaptan miras
      normalSide: this._normalSide, // Ana hesaptan miras
      isPostable: true, // Yeni açılan uç hesap varsayılan olarak aktiftir
    });
  }

  public isDebitNormal(): boolean {
    return this._normalSide === AccountSideSchema.enum.DEBIT;
  }

  public deactivate(): void {
    this._isActive = false;
  }

  public activate(): void {
    this._isActive = true;
  }

  public rename(newName: string): void {
    const trimmedName = newName?.trim();

    if (!trimmedName) {
      throw new BadRequestException(
        'Hesap adı boş bırakılamaz veya sadece boşluktan oluşamaz.'
      );
    }

    // (Veritabanı varchar sınırlarını patlatmamak için)
    if (trimmedName.length < 2 || trimmedName.length > 200) {
      throw new BadRequestException(
        'Hesap adı en az 2, en fazla 200 karakter olmalıdır.'
      );
    }

    if (this._name !== trimmedName) {
      this._name = trimmedName;
      this._updatedAt = new Date();
    }
  }

  public togglePostable(status: boolean): void {
    this._isPostable = status;
    this._updatedAt = new Date();
  }

  public toPersistence(): IAccount {
    return {
      id: this._id,
      clinicId: this._clinicId,
      organizationId: this._organizationId,
      code: this._code.value,
      name: this._name,
      parentId: this._parentId,
      type: this._type,
      normalSide: this._normalSide,
      isPostable: this._isPostable,
      requiresParty: this._requiresParty,
      currency: this._currency ? this._currency.value : null,
      isActive: this._isActive,
      createdAt: this._createdAt,
      updatedAt: new Date(),
    };
  }
}
