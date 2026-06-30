export class Guard<T> {
  private constructor(
    private readonly _value: T,
    private readonly condition: boolean,
    private readonly exception: Error
  ) {}

  get value(): T {
    return this._value;
  }

  public static monitor<K>(
    value: K,
    condition: boolean,
    exception: Error
  ): Guard<K> {
    return new Guard(value, condition, exception);
  }

  /**
   *  Exclude<T, undefined> kullanarak
   *
   */
  public orThrow(): Exclude<T, undefined> {
    if (!this.condition) {
      throw this.exception;
    }
    return this._value as Exclude<T, undefined>;
  }
}
