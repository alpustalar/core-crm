import { GrantUserCapabilityData } from '@modules/identity/user/domain/contracts/user-capability.contracts';

export const USER_CAPABILITY_COMMAND_REPOSITORY = Symbol(
  'IUserCapabilityCommandRepository'
);

export interface IUserCapabilityCommandRepository {
  /**
   * Kişiye özel yetki kaydı açar. `(userId, capabilityId)` benzersiz olduğu için
   * aynı yetki iki kez verilemez; ikinci çağrı sessizce ilkini korur.
   */
  grant(data: GrantUserCapabilityData): Promise<void>;

  /**
   * Kaydı siler. Yetki gerçekten kaldırıldıysa `true`, ortada böyle bir kişisel
   * yetki yoksa `false` döner — çağıran "rolden gelen yetkiyi kaldıramazsınız"
   * uyarısını buna göre verir.
   */
  revoke(userId: string, capabilityId: string): Promise<boolean>;

  /** `module:action` karşılığı Capability satırının id'si; tanımsızsa null. */
  findCapabilityIdByKey(capabilityKey: string): Promise<string | null>;

  /**
   * Yetki hedefin ROLÜNDEN geliyor mu? Kişisel kayıt açma kararını beslediği için
   * (ve yazma bağlamında olduğumuz için) okuma Command Repo'dan yapılır.
   */
  roleGrantsCapability(userId: string, capabilityId: string): Promise<boolean>;
}
