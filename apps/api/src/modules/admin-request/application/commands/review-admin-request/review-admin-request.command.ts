import { IGetContext } from '@common/decorators/get-context.decorator';
import { ReviewAdminRequestDto } from '@shared/modules/admin-request/dto/commands';

export class ReviewAdminRequestCommand {
  constructor(
    public readonly requestId: string,
    public readonly dto: ReviewAdminRequestDto,
    public readonly ctx: IGetContext
  ) {}
}
