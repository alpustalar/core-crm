import { CreateOrganizationProps } from '@modules/organization/domain/types/create-organization.props';
import { UpdateOrganizationProps } from '@modules/organization/domain/types/update-organization.props';
import { Organization } from '@shared';

export const ORGANIZATION_REPO_TOKEN = Symbol('IOrganizationRepository');

export interface IOrganizationRepository {
  /**
   * Yeni bir organizasyon oluşturur.
   * Başarısızlık durumunda Exception fırlatır
   */
  create(data: CreateOrganizationProps): Promise<Organization>;

  /**
   * ID ile organizasyon arar.
   */
  findOneWithAnId(id: string): Promise<Organization | null>;

  /**
   * Slug ile organizasyon arar.
   */
  findOneWithASlug(slug: string): Promise<Organization | null>;

  /**
   * Sahibi olan kullanıcının credentials bilgilerine göre ilk organizasyonu getirir.
   */
  findFirstByOwnerCredentials(ownerId: string): Promise<Organization | null>;

  /**
   * Belirli bir sahibin (owner) belirli bir organizasyonuna erişir.
   */
  findOneByIdByOwner(
    ownerId: string,
    organizationId: string
  ): Promise<Organization | null>;

  /**
   * Organizasyon bilgilerini günceller.
   */
  updateByOwner(
    organizationId: string,
    data: UpdateOrganizationProps
  ): Promise<Organization>;

  /**
   * Organizasyonu statüsünü DELETED yaparak yumuşak silme uygular.
   */
  softDelete(id: string): Promise<Organization>;
}
