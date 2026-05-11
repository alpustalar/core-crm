import { OrganizationEntity } from '@modules/organization/domain/entities/organization.entity';

export type IOrganization = Omit<
  OrganizationEntity,
  'hasCompleteProfile' | 'isActive' | 'isDeleted'
>;
