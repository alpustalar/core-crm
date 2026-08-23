import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';
import { AdminRequest } from '@modules/platform/admin-request/domain/entities/admin-request.entity';

export const ADMIN_REQUEST_COMMAND_REPOSITORY = Symbol(
  'IAdminRequestCommandRepository'
);

export interface IAdminRequestCommandRepository
  extends IBaseCommandRepository<AdminRequest> {
  /**
   * Talebi `FOR UPDATE` kilitleyerek yükler — yalnız aktif transaction içinde.
   * İnceleme (onay/ret) kararını besleyen okuma kilitsiz yapılırsa iki yönetici
   * aynı bekleyen talebi aynı anda sonuçlandırabilir.
   */
  findByIdForUpdate(id: string): Promise<AdminRequest | null>;
}
