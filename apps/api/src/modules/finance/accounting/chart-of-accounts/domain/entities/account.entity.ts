import { Account as IAccount, AccountSideSchema } from '@shared';
import { AggregateRoot } from '@common/domain/aggregate-root';
import {
  AccountTemplateNode,
  CLINIC_CHART_OF_ACCOUNTS_TEMPLATE,
} from '../constants/clinic-chart-of-accounts.template';
import { AccountCode } from '@modules/finance/accounting/chart-of-accounts/domain/value-objects/account-code.vo';
import { Currency } from '@src/domain/value-objects/currency.vo';
import { AccountTypeType as AccountType } from '@input-type-schemas/AccountTypeSchema';
import { AccountSideType as AccountSide } from '@input-type-schemas/AccountSideSchema';
import {
  CreateAccountProps,
  CreateChildAccountProps,
} from '@modules/finance/accounting/chart-of-accounts/domain/chart-of-accounts.contracts';
import {
  AccountTemplateMismatchException,
  CannotCreateChildException,
} from '@modules/finance/accounting/chart-of-accounts/domain/exceptions/chart-of-accounts.exceptions';
import { UUID } from '@src/domain/value-objects/uuid.vo';
import { Name } from '@src/domain/value-objects/name.vo';
import { DateTimeManager } from '@common/infrastructure/date-time/date-time.manager';

export interface BuildChartInput {
  clinicId: string;
  organizationId: string;
}

export class Account extends AggregateRoot {
  constructor(data: IAccount) {
    super();
    this._id = UUID.fromTrusted(data.id);
    this._clinicId = UUID.fromTrusted(data.clinicId);
    this._organizationId = UUID.fromTrusted(data.organizationId);
    this._code = AccountCode.create(data.code);
    this._name = Name.fromTrusted(data.name);
    this._parentId = data.parentId;
    this._type = data.type;
    this._normalSide = data.normalSide;
    this._isPostable = data.isPostable;
    this._requiresParty = data.requiresParty;
    this._currency = Currency.create(data.currency)?.instance ?? null;

    this._isActive = data.isActive;
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

  private _organizationId: UUID;
  get organizationId(): UUID {
    return this._organizationId;
  }

  private _code: AccountCode;
  get code(): AccountCode {
    return this._code;
  }

  private _name: Name;
  get name(): Name {
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
    const currencyStr =
      Currency.create(props.currency)?.instance?.value ?? null;

    const id = props.id ? UUID.create(props.id).orThrow() : UUID.generate();

    const now = DateTimeManager.create();

    const name = Name.create(props.name).orThrow();

    return new Account({
      id: id.value,
      clinicId: UUID.create(props.clinicId).orThrow().value,
      organizationId: UUID.create(props.organizationId).orThrow().value,
      code: accountCode.value,
      name: name.value,
      parentId: props.parentId ?? null,
      type: props.type,
      normalSide: props.normalSide,
      isPostable: props.isPostable ?? true,
      requiresParty: props.requiresParty ?? false,
      currency: currencyStr,
      isActive: props.isActive ?? true,
      createdAt: now,
      updatedAt: now,
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
          throw new AccountTemplateMismatchException(
            node.code,
            parentNode.code
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

  public createChild(props: CreateChildAccountProps): Account {
    // İş Kuralı: Eğer bu hesaba daha önce doğrudan kayıt atılabiliyorduysa,
    // altına çocuk açıldığı an bu hesap artık "kolektif/ana" hesap olur ve doğrudan kayıt kabul etmez.
    if (this._isPostable) {
      throw new CannotCreateChildException(this._code.value);
    }

    return Account.create({
      ...props,
      parentId: this._id.value,
      clinicId: this._clinicId.value,
      organizationId: this._organizationId.value,
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
    this._name = Name.create(newName).orThrow();
    this._updatedAt = new Date();
  }

  public togglePostable(status: boolean): void {
    this._isPostable = status;
    this._updatedAt = new Date();
  }

  public toPersistence(): IAccount {
    return {
      id: this._id.value,
      clinicId: this._clinicId.value,
      organizationId: this._organizationId.value,
      code: this._code.value,
      name: this._name.value,
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
