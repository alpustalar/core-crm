import { Prisma, Provider } from '@prisma/client';
import { Pagination } from '@shared';

export const PROVIDER_REPO_TOKEN = Symbol('IProviderRepository');

export type IProvider = Provider;
export type IProviderCreate = Prisma.ProviderCreateInput;
export type IProviderUpdate = Prisma.ProviderUpdateInput;

export type PaginatedProviders = {
  items: IProvider[];
  total: number;
};

export interface IProviderRepository {
  create(data: IProviderCreate): Promise<IProvider>;
  findById(providerId: string): Promise<IProvider | null>;
  findAllByClinicId(
    pagination: Pagination,
    clinicId: string
  ): Promise<PaginatedProviders>;
  findAllByOrganizationIds(
    pagination: Pagination,
    organizationIds: string[]
  ): Promise<PaginatedProviders>;
  update(providerId: string, data: IProviderUpdate): Promise<IProvider>;
}
