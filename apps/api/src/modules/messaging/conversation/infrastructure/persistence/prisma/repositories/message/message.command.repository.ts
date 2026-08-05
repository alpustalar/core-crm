import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IMessageCommandRepository } from '@modules/messaging/conversation/domain/repositories/message.repository';
import { Message } from '@modules/messaging/conversation/domain/entities/message.entity';

@Injectable()
export class MessageCommandRepository
  extends BaseRepository
  implements IMessageCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(entity: Message): Promise<Message> {
    const data = entity.toPersistence();
    // Prisma nullable Json: JS null yerine Prisma.JsonNull beklenir.
    const templateParams =
      data.templateParams === null
        ? Prisma.JsonNull
        : (data.templateParams as Prisma.InputJsonValue);
    const payload =
      data.payload === null
        ? Prisma.JsonNull
        : (data.payload as Prisma.InputJsonValue);

    const raw = await this.db.message.create({
      data: { ...data, templateParams, payload },
    });
    entity.flushEvents();
    return new Message(raw);
  }

  async update(entity: Message): Promise<Message> {
    const data = entity.toPersistence();

    const raw = await this.db.message.update({
      where: { id: data.id },
      data: {
        status: data.status,
        externalId: data.externalId,
        errorReason: data.errorReason,
        errorCode: data.errorCode,
        pricingCategory: data.pricingCategory,
        billable: data.billable,
      },
    });
    entity.flushEvents();
    return new Message(raw);
  }
}
