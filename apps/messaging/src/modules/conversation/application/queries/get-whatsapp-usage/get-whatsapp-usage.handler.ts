import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  IMessageQueryRepository,
  MESSAGE_QUERY_REPOSITORY,
} from '@modules/conversation/domain/repositories/message.repository';
import { GetWhatsappUsageQuery } from './get-whatsapp-usage.query';
import { GetWhatsappUsageResponse } from './get-whatsapp-usage.response';

@QueryHandler(GetWhatsappUsageQuery)
export class GetWhatsappUsageHandler implements IQueryHandler<
  GetWhatsappUsageQuery,
  GetWhatsappUsageResponse
> {
  constructor(
    @Inject(MESSAGE_QUERY_REPOSITORY)
    private readonly messageQueryRepo: IMessageQueryRepository
  ) {}

  async execute(
    query: GetWhatsappUsageQuery
  ): Promise<GetWhatsappUsageResponse> {
    const { payload } = query;
    const byCategory = await this.messageQueryRepo.aggregateUsageByCategory({
      clinicId: payload.clinicId,
      from: payload.from,
      to: payload.to,
    });

    const totalBillable = byCategory.reduce((sum, c) => sum + c.count, 0);

    return {
      data: {
        from: payload.from,
        to: payload.to,
        totalBillable,
        byCategory,
      },
    };
  }
}
