import { z } from 'zod';
import { Guard } from '@common/domain/guards';
import { InvalidPriorityException } from '@src/domain/exceptions/priority.exceptions';

export class Priority {
  // 1. İş Kuralı Şeması
  private static readonly schema = z.number().int().min(1).max(100);
  private readonly _value: number;

  private constructor(value: number) {
    this._value = value;
    Object.freeze(this);
  }

  get value(): number {
    return this._value;
  }

  // Not: Guard.monitor kullanımını koruyoruz çünkü bunlar "nesne durumu" kontrolü.
  public get validate() {
    return {
      isPrivilegedUser: this.isPrivilegedUser(),
      isAdmin: this.isAdmin(),
      isHigherThan: (other: Priority) =>
        this.compare(this._value > other._value),
      isLowerThan: (other: Priority) =>
        this.compare(this._value < other._value),
      isEqual: (other: Priority) => this.compare(this._value === other._value),
    };
  }

  // 2. Disiplinli Factory: create().orThrow()
  public static create(value: number | string | null | undefined) {
    const normalized = typeof value === 'string' ? parseInt(value, 10) : value;
    const result = this.schema.safeParse(normalized);

    const instance = result.success ? new Priority(result.data) : undefined;

    return {
      instance,
      orThrow(exception?: Error): Priority {
        if (!instance) {
          throw exception ?? new InvalidPriorityException(result.data);
        }
        return instance;
      },
    };
  }

  public static fromTrusted(value: number): Priority {
    return new Priority(value);
  }

  private isPrivilegedUser() {
    const is = this._value >= 80;
    return Guard.monitor(is, is, () => new Error('İmtiyazlı kullanıcı değil.'));
  }

  private isAdmin() {
    const is = this._value >= 100;
    return Guard.monitor(
      is,
      is,
      () => new Error('Admin yetkisine sahip değil.')
    );
  }

  private compare(condition: boolean) {
    return Guard.monitor(
      condition,
      condition,
      () => new Error('Karşılaştırma başarısız.')
    );
  }
}
