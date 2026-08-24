import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IUserCapabilityCommandRepository } from '@modules/identity/user/domain/repositories/user-capability/user-capability.command.repository';
import { GrantUserCapabilityData } from '@modules/identity/user/domain/contracts';

@Injectable()
export class UserCapabilityCommandRepository
  extends BaseRepository
  implements IUserCapabilityCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async grant(data: GrantUserCapabilityData): Promise<void> {
    // Aynı yetkiyi iki yönetici aynı anda verirse benzersiz kısıt patlamasın;
    // ikinci çağrı ilk kaydı (ve onun "kim verdi" izini) korur.
    await this.db.userCapability.createMany({
      data: [data],
      skipDuplicates: true,
    });
  }

  async revoke(userId: string, capabilityId: string): Promise<boolean> {
    const { count } = await this.db.userCapability.deleteMany({
      where: { userId, capabilityId },
    });
    return count > 0;
  }

  async findCapabilityIdByKey(capabilityKey: string): Promise<string | null> {
    const [module, action] = capabilityKey.split(':');
    if (!module || !action) return null;

    const capability = await this.db.capability.findUnique({
      where: { module_action: { module, action } },
      select: { id: true },
    });
    return capability?.id ?? null;
  }

  async roleGrantsCapability(
    userId: string,
    capabilityId: string
  ): Promise<boolean> {
    const match = await this.db.user.findFirst({
      where: { id: userId, role: { capabilities: { some: { capabilityId } } } },
      select: { id: true },
    });
    return match !== null;
  }
}
