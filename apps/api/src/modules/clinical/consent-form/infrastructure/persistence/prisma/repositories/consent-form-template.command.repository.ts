import { Injectable } from '@nestjs/common';
import { BaseCommandRepository } from '@src/infrastructure/persistence/prisma/base-command.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IConsentTemplateCommandRepository } from '@modules/clinical/consent-form/domain/repositories/consent-form.repository';
import { ConsentFormTemplate } from '@modules/clinical/consent-form/domain/entities/consent-form-template.entity';

@Injectable()
export class ConsentFormTemplateCommandRepository
  extends BaseCommandRepository<ConsentFormTemplate>
  implements IConsentTemplateCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(entity: ConsentFormTemplate): Promise<ConsentFormTemplate> {
    const raw = await this.db.consentFormTemplate.create({
      data: entity.toPersistence(),
    });
    entity.flushEvents();
    return new ConsentFormTemplate(raw);
  }

  async findById(id: string): Promise<ConsentFormTemplate | null> {
    const raw = await this.db.consentFormTemplate.findUnique({
      where: { id },
    });
    return raw ? new ConsentFormTemplate(raw) : null;
  }

  async save(entity: ConsentFormTemplate): Promise<ConsentFormTemplate> {
    const data = entity.toPersistence();
    const { id, ...update } = data;
    const raw = await this.db.consentFormTemplate.update({
      where: { id },
      data: update,
    });
    entity.flushEvents();
    return new ConsentFormTemplate(raw);
  }
}
