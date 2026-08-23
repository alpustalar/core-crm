import { User as IUser } from '@shared';
import { GlobalStatusType } from '@input-type-schemas/GlobalStatusSchema';
import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';
import { User } from '@modules/identity/user/domain/entities/user.entity';

export const USER_COMMAND_REPOSITORY = Symbol('IUserCommandRepository');

export interface IUserCommandRepository extends IBaseCommandRepository<User> {
  updateLastLogin(userId: string): Promise<IUser>;
  softDeleteAllByClinicIds(
    clinicId: string[] | string
  ): Promise<{ deletedCount: number }>;
  changeStatus(
    status: GlobalStatusType,
    clinicId: string
  ): Promise<{ affectedCount: number }>;

  /**
   * Organizasyonun sahiplerini yeni kliniğin yöneticileri arasına ekler.
   *
   * Toplu ilişki yazımıdır: entity yüklemek N+1 üretir ve burada işletilecek bir
   * iş kuralı yok (sahiplik zaten kurulmuş, klinik zaten yaratılmış). Yalnız
   * eksik bağı kuranlar güncellenir → tekrar çağrılması güvenlidir.
   */
  addManagedClinicToOrganizationOwners(
    organizationId: string,
    clinicId: string
  ): Promise<{ attachedCount: number }>;
}
