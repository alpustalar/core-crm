export class Guard<T> {
  private constructor(
    private readonly _value: T,
    private readonly condition: boolean,
    private readonly exceptionFactory: () => Error
  ) {}

  get value(): T {
    return this._value;
  }

  public static monitor<K>(
    value: K,
    condition: boolean,
    exceptionFactory: () => Error
  ): Guard<K> {
    return new Guard(value, condition, exceptionFactory);
  }

  /**
   * Koşul sağlanmadıysa hatayı fırlatır, sağlandıysa tipi null undefinedtan arındırarak döner.
   */
  public orThrow(): Exclude<T, undefined | null> {
    if (!this.condition) {
      throw this.exceptionFactory();
    }
    return this._value as Exclude<T, undefined | null>;
  }
}
