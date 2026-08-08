import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';
import { AdminRequest } from '@modules/platform/admin-request/domain/entities/admin-request.entity';

export const ADMIN_REQUEST_COMMAND_REPOSITORY = Symbol(
  'IAdminRequestCommandRepository'
);

export type IAdminRequestCommandRepository =
  IBaseCommandRepository<AdminRequest>;
