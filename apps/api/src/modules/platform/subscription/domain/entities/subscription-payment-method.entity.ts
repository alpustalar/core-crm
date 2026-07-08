import { SubscriptionPaymentMethod as ISubscriptionPaymentMethod } from '@shared';
import { AggregateRoot } from '@common/domain/aggregate-root';
import { UUID } from '@src/domain/value-objects/uuid.vo';
import { DateTimeManager } from '@common/utils';
import { CreateSubscriptionPaymentMethodProps } from '@modules/platform/subscription/domain/subscription.contracts';

const DEFAULT_PROVIDER = 'IYZICO';

/**
 * Aboneliğe bağlı kayıtlı ödeme yöntemi (kart saklama). İlk ödemenin callback'inde iyzico'nun
 * ürettiği cardUserKey/cardToken saklanır; yenileme günü non-3DS payment.create ile kullanılır.
 */
export class SubscriptionPaymentMethod extends AggregateRoot {
  constructor(data: ISubscriptionPaymentMethod) {
    super();
    this._id = data.id;
    this._subscriptionId = data.subscriptionId;
    this._provider = data.provider;
    this._cardUserKey = data.cardUserKey;
    this._cardToken = data.cardToken;
    this._maskedNumber = data.maskedNumber;
    this._cardAssociation = data.cardAssociation;
    this._cardFamily = data.cardFamily;
    this._buyerName = data.buyerName;
    this._buyerSurname = data.buyerSurname;
    this._buyerEmail = data.buyerEmail;
    this._buyerGsmNumber = data.buyerGsmNumber;
    this._buyerIp = data.buyerIp;
    this._buyerCity = data.buyerCity;
    this._buyerAddress = data.buyerAddress;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
  }

  private _id: string;
  get id(): string {
    return this._id;
  }

  private _subscriptionId: string;
  get subscriptionId(): string {
    return this._subscriptionId;
  }

  private _provider: string;
  get provider(): string {
    return this._provider;
  }

  private _cardUserKey: string;
  get cardUserKey(): string {
    return this._cardUserKey;
  }

  private _cardToken: string;
  get cardToken(): string {
    return this._cardToken;
  }

  private _maskedNumber: string | null;
  get maskedNumber(): string | null {
    return this._maskedNumber;
  }

  private _cardAssociation: string | null;
  get cardAssociation(): string | null {
    return this._cardAssociation;
  }

  private _cardFamily: string | null;
  get cardFamily(): string | null {
    return this._cardFamily;
  }

  private _buyerName: string;
  get buyerName(): string {
    return this._buyerName;
  }

  private _buyerSurname: string;
  get buyerSurname(): string {
    return this._buyerSurname;
  }

  private _buyerEmail: string;
  get buyerEmail(): string {
    return this._buyerEmail;
  }

  private _buyerGsmNumber: string;
  get buyerGsmNumber(): string {
    return this._buyerGsmNumber;
  }

  private _buyerIp: string;
  get buyerIp(): string {
    return this._buyerIp;
  }

  private _buyerCity: string | null;
  get buyerCity(): string | null {
    return this._buyerCity;
  }

  private _buyerAddress: string | null;
  get buyerAddress(): string | null {
    return this._buyerAddress;
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
    props: CreateSubscriptionPaymentMethodProps
  ): SubscriptionPaymentMethod {
    const id = props.id ? UUID.create(props.id).orThrow() : UUID.generate();
    const now = DateTimeManager.create();

    return new SubscriptionPaymentMethod({
      id: id.value,
      subscriptionId: UUID.create(props.subscriptionId).orThrow().value,
      provider: props.provider ?? DEFAULT_PROVIDER,
      cardUserKey: props.cardUserKey,
      cardToken: props.cardToken,
      maskedNumber: props.maskedNumber ?? null,
      cardAssociation: props.cardAssociation ?? null,
      cardFamily: props.cardFamily ?? null,
      buyerName: props.buyerName,
      buyerSurname: props.buyerSurname,
      buyerEmail: props.buyerEmail,
      buyerGsmNumber: props.buyerGsmNumber,
      buyerIp: props.buyerIp,
      buyerCity: props.buyerCity ?? null,
      buyerAddress: props.buyerAddress ?? null,
      createdAt: now,
      updatedAt: now,
    });
  }

  public toPersistence(): ISubscriptionPaymentMethod {
    return {
      id: this._id,
      subscriptionId: this._subscriptionId,
      provider: this._provider,
      cardUserKey: this._cardUserKey,
      cardToken: this._cardToken,
      maskedNumber: this._maskedNumber,
      cardAssociation: this._cardAssociation,
      cardFamily: this._cardFamily,
      buyerName: this._buyerName,
      buyerSurname: this._buyerSurname,
      buyerEmail: this._buyerEmail,
      buyerGsmNumber: this._buyerGsmNumber,
      buyerIp: this._buyerIp,
      buyerCity: this._buyerCity,
      buyerAddress: this._buyerAddress,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
