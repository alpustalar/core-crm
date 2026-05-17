import { IGetContext } from '@common/decorators/get-context.decorator';
import { AuthUserResponse } from '@modules/user/domain/types/auth-user-response.type';
import { CreateUser } from '@shared';
import { CreateUserInternalRelations } from '@modules/user/domain/types/create-user-internal-relations.type';

export interface IUserModuleApi {
  softDeleteManyWithAClinicId(
    clinicId: string,
    context?: IGetContext
  ): Promise<void>;
  softDeleteManyWithAnOrganizationId(
    organizationId: string,
    context?: IGetContext
  ): Promise<void>;
  findUserForAuth(firebaseUid: string): Promise<AuthUserResponse | null>;
  updateLastLogin(userId: string): Promise<string | null>;
  create(
    dto: CreateUser,
    context: IGetContext,
    internalRelations?: CreateUserInternalRelations
  ): Promise<string>;
}

export const USER_MODULE_API_TOKEN = Symbol('USER_MODULE_API_TOKEN');
