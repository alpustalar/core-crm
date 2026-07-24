import { IGetContext } from '@common/decorators/get-context.decorator';
import { ReviewAdminRequest } from '@shared';

export class ReviewAdminRequestCommand {
  constructor(
    public readonly payload: {
      requestId: string;
      data: ReviewAdminRequest;
      ctx: IGetContext;
    }
  ) {}
}
