import { IGetContext } from '@common/decorators/get-context.decorator';
import { CreateOrganizationDto } from '@shared';
import { CreateOrganizationResponse } from '@modules/organization/application/commands/create-organization/create-organization.response';

export const ORGANIZATION_MODULE_API_TOKEN = Symbol('IOrganizationModuleApi');

export interface IOrganizationModuleApi {
  create(dto: CreateOrganizationDto, context?: IGetContext): Promise<CreateOrganizationResponse>;
}
