import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';
import { Project } from '@modules/organization/project/domain/entities/project.entity';

export const PROJECT_COMMAND_REPOSITORY = Symbol('IProjectCommandRepository');

export type IProjectCommandRepository = IBaseCommandRepository<Project> & {
  /**
   * Klinik içinde proje kodunun sahibi. Kod benzersizliği DB'de unique ile de
   * korunur; bu okuma kullanıcıya anlamlı hata döndürmek içindir.
   */
  findByCode(clinicId: string, code: string): Promise<Project | null>;
};
