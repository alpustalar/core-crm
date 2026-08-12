import { EffectiveCapability } from '@modules/identity/user/domain/contracts/user-capability.contracts';

export const USER_CAPABILITY_QUERY_REPOSITORY = Symbol(
  'IUserCapabilityQueryRepository'
);

export interface IUserCapabilityQueryRepository {
  /**
   * Kullanıcının etkin yetkileri: rolünden gelenler + kişiye verilenler,
   * kaynağı (`ROLE` / `GRANT`) işaretlenmiş hâlde.
   */
  findEffectiveCapabilities(userId: string): Promise<EffectiveCapability[]>;
}
