import { Employee } from '@modules/hr/employee/domain/entities/employee.entity';
import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';

export const EMPLOYEE_COMMAND_REPOSITORY = Symbol('IEmployeeCommandRepository');

export interface IEmployeeCommandRepository
  extends IBaseCommandRepository<Employee> {
  /**
   * Çalışanı `FOR UPDATE` kilitleyerek yükler — yalnız aktif transaction içinde.
   *
   * İzin bakiyesi hesabının çapası budur: bakiye tek bir satırda durmaz (hak ediş −
   * onaylı günler), kilitlenecek tek satır olmadığı için çalışanın kendi satırı
   * serileştirme noktası olarak kullanılır. Satır yoksa `lockRowForUpdateOrFail`
   * patlar — kilitsiz devam edip bakiyeyi korumasız bırakmaz.
   */
  findByIdForUpdate(id: string): Promise<Employee | null>;
}
