import { IGetContext } from '@common/decorators/get-context.decorator';
import { CreateAdminRequestDto } from '@shared/modules/admin-request/dto/commands';

export class CreateAdminRequestCommand {
  public readonly __responseType!: string;
  constructor(
    public readonly data: CreateAdminRequestDto,
    public readonly ctx: IGetContext
  ) {}
}
