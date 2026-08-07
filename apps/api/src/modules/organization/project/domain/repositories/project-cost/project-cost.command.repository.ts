import { ProjectCost } from '@modules/organization/project/domain/entities/project-cost.entity';

export const PROJECT_COST_COMMAND_REPOSITORY = Symbol(
  'IProjectCostCommandRepository'
);

/**
 * Maliyet kalemi değişmezdir → `update` yoktur (yanlış kalem silinip yeniden
 * girilir). Bu yüzden `IBaseCommandRepository` genişletilmez.
 */
export interface IProjectCostCommandRepository {
  create(entity: ProjectCost): Promise<ProjectCost>;
  findById(id: string): Promise<ProjectCost | null>;
  delete(id: string): Promise<void>;

  /**
   * Dış kaydın (satın alma faturası / iş emri) bu projeye zaten etiketlenip
   * etiketlenmediği. DB'de unique ile de korunur; bu okuma kullanıcıya anlamlı
   * hata döndürmek için.
   */
  findBySourceRef(
    projectId: string,
    source: string,
    sourceRefId: string
  ): Promise<ProjectCost | null>;
}
