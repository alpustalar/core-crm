import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  MESSAGE_QUERY_REPOSITORY,
  IMessageQueryRepository,
} from '@modules/messaging/conversation/domain/repositories/message.repository';
import { GetWhatsappUsageQuery } from './get-whatsapp-usage.query';
import { GetWhatsappUsageResponse } from './get-whatsapp-usage.response';

@QueryHandler(GetWhatsappUsageQuery)
export class GetWhatsappUsageHandler
  implements IQueryHandler<GetWhatsappUsageQuery, GetWhatsappUsageResponse>
{
  constructor(
    @Inject(MESSAGE_QUERY_REPOSITORY)
    private readonly messageQueryRepo: IMessageQueryRepository
  ) {}

  async execute(
    query: GetWhatsappUsageQuery
  ): Promise<GetWhatsappUsageResponse> {
    const byCategory = await this.messageQueryRepo.aggregateUsageByCategory({
      clinicId: query.clinicId,
      from: query.from,
      to: query.to,
    });

    const totalBillable = byCategory.reduce((sum, c) => sum + c.count, 0);

    return {
      data: {
        from: query.from,
        to: query.to,
        totalBillable,
        byCategory,
      },
    };
  }
}
