import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { BaseCommandRepository } from '@src/infrastructure/persistence/prisma/base-command.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IMessageCommandRepository } from '@modules/messaging/conversation/domain/repositories/message.repository';
import { Message } from '@modules/messaging/conversation/domain/entities/message.entity';

@Injectable()
export class MessageCommandRepository
  extends BaseCommandRepository<Message>
  implements IMessageCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string): Promise<Message | null> {
    const raw = await this.db.message.findUnique({ where: { id } });
    return raw ? new Message(raw) : null;
  }

  async findByIdForUpdate(id: string): Promise<Message | null> {
    await this.lockRowForUpdate('messages', id);
    return this.findById(id);
  }

  async findByExternalId(externalId: string): Promise<Message | null> {
    const raw = await this.db.message.findUnique({ where: { externalId } });
    return raw ? new Message(raw) : null;
  }

  async findByExternalIdForUpdate(externalId: string): Promise<Message | null> {
    const existing = await this.db.message.findUnique({
      where: { externalId },
      select: { id: true },
    });
    if (!existing) return null;

    return this.findByIdForUpdate(existing.id);
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
