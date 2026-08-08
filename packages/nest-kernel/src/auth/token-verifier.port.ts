export const TOKEN_VERIFIER = Symbol('ITokenVerifier');

/** Doğrulanmış kimlik bilgisinden çekirdeğin ihtiyaç duyduğu asgari alanlar. */
export interface VerifiedToken {
  /** Kimlik sağlayıcısının kullanıcı kimliği (Firebase uid). */
  readonly uid: string;
  readonly email?: string;
}

/**
 * Kimlik doğrulayıcı sınırı.
 *
 * Çekirdek bilerek `firebase-admin`'e bağlanmaz: sözleşme yalnız "bu token geçerli mi,
 * kime ait?" sorusunu taşır. Tüketen app kendi sağlayıcısını bağlar (`apps/api` mevcut
 * `FirebaseService`'i sarar). Böylece kimlik sağlayıcısı değişirse çekirdek etkilenmez
 * ve messaging, kullanıcı yönetimi metotlarını (createUser/deleteUser/changePassword)
 * hiç görmeden yalnız doğrulama yeteneğini alır.
 */
export interface ITokenVerifier {
  /** Geçersiz/süresi dolmuş token için `null` döner; istisna fırlatmaz. */
  verify(idToken: string): Promise<VerifiedToken | null>;
}
