import { Injectable } from '@nestjs/common';
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

  async save(entity: Message): Promise<Message> {
    const data = entity.toPersistence();
    const raw = await this.db.message.upsert({
      where: { id: data.id },
      create: data,
      update: {
        status: data.status,
        externalId: data.externalId,
        errorReason: data.errorReason,
      },
    });
    entity.flushEvents();
    return new Message(raw);
  }
}
