export class Guard<T> {
  private constructor(
    private readonly _value: T,
    private readonly condition: boolean,
    // 🚀 Doğrudan Error yerine, Error dönen bir fonksiyon (Thunk/Callback) saklıyoruz
    private readonly exceptionFactory: () => Error
  ) {}

  get value(): T {
    return this._value;
  }

  public static monitor<K>(
    value: K,
    condition: boolean,
    exceptionFactory: () => Error // 🚀 Hata fabrikası
  ): Guard<K> {
    return new Guard(value, condition, exceptionFactory);
  }

  /**
   * Koşul sağlanmadıysa hatayı fırlatır, sağlandıysa tipi null/undefined'dan arındırarak döner.
   */
  public orThrow(): Exclude<T, undefined | null> {
    if (!this.condition) {
      // 🚀 Sadece ve sadece hata varsa fonksiyon tetiklenir ve Error nesnesi belleğe alınır!
      throw this.exceptionFactory();
    }
    return this._value as Exclude<T, undefined | null>;
  }
}
