import { createZodDto } from 'nestjs-zod';
import { GrantOrganizationOwnershipSchema } from '../../schemas/commands';

export class GrantOrganizationOwnershipDto extends createZodDto(
  GrantOrganizationOwnershipSchema
) {}
