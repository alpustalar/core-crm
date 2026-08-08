import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';
import { Organization } from '@modules/organization/organization/domain/entities/organization.entity';

export const ORGANIZATION_COMMAND_REPOSITORY = Symbol(
  'IOrganizationCommandRepository'
);

export type IOrganizationCommandRepository =
  IBaseCommandRepository<Organization>;
