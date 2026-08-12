export type {
  ITenantScopeResolver,
  TenantScopeInput,
} from '@shared/modules/clinic/interfaces';

/**
 * Kiracı kapsamı çözücü injection token'ı.
 *
 * Sözleşme @shared'te (framework-agnostik), token ve adapter sahibi modülün
 * domain katmanında durur. Clinic başka bir servise taşındığında tüketiciler
 * değişmez; yalnızca bu token'a bağlanan adapter (in-process → NATS/HTTP) değişir.
 */
export const TENANT_SCOPE_RESOLVER = Symbol('ITenantScopeResolver');
