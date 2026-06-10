import { Account as IAccount, AccountSide, AccountType } from '@prisma/client';
import { AggregateRoot } from '@common/domain/aggregate-root';
import { CreateAccountProps } from '../types/create-account.props';
import {
  AccountTemplateNode,
  CLINIC_CHART_OF_ACCOUNTS_TEMPLATE,
} from '../constants/clinic-chart-of-accounts.template';

export class Account extends AggregateRoot implements IAccount {
  constructor(data: IAccount) {
    super();
    this._id = data.id;
    this._organizationId = data.organizationId;
    this._code = data.code;
    this._name = data.name;
    this._parentId = data.parentId;
    this._type = data.type;
    this._normalSide = data.normalSide;
    this._isPostable = data.isPostable;
    this._requiresParty = data.requiresParty;
    this._currency = data.currency;
    this._isActive = data.isActive;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
  }

  private _id: string;
  get id(): string {
    return this._id;
  }

  private _organizationId: string;
  get organizationId(): string {
    return this._organizationId;
  }

  private _code: string;
  get code(): string {
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

  private _currency: string | null;
  get currency(): string | null {
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
    return new Account({
      id: props.id ?? crypto.randomUUID(),
      organizationId: props.organizationId,
      code: props.code,
      name: props.name,
      parentId: props.parentId ?? null,
      type: props.type,
      normalSide: props.normalSide,
      isPostable: props.isPostable ?? true,
      requiresParty: props.requiresParty ?? false,
      currency: props.currency ?? null,
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
    organizationId: string,
    template: readonly AccountTemplateNode[] = CLINIC_CHART_OF_ACCOUNTS_TEMPLATE
  ): Account[] {
    const idByCode = new Map<string, string>();
    template.forEach((node) => idByCode.set(node.code, crypto.randomUUID()));

    return template.map((node) =>
      Account.create({
        id: idByCode.get(node.code),
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
      })
    );
  }

  public isDebitNormal(): boolean {
    return this._normalSide === AccountSide.DEBIT;
  }

  public deactivate(): void {
    this._isActive = false;
  }

  public activate(): void {
    this._isActive = true;
  }

  public toPersistence(): IAccount {
    return {
      id: this._id,
      organizationId: this._organizationId,
      code: this._code,
      name: this._name,
      parentId: this._parentId,
      type: this._type,
      normalSide: this._normalSide,
      isPostable: this._isPostable,
      requiresParty: this._requiresParty,
      currency: this._currency,
      isActive: this._isActive,
      createdAt: this._createdAt,
      updatedAt: new Date(),
    };
  }
}
