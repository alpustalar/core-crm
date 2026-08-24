import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IUserCapabilityQueryRepository } from '@modules/identity/user/domain/repositories/user-capability/user-capability.query.repository';
import { EffectiveCapability } from '@modules/identity/user/domain/contracts';

@Injectable()
export class UserCapabilityQueryRepository
  extends BaseRepository
  implements IUserCapabilityQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findEffectiveCapabilities(
    userId: string
  ): Promise<EffectiveCapability[]> {
    const user = await this.db.user.findUnique({
      where: { id: userId },
      select: {
        role: {
          select: {
            capabilities: {
              select: {
                capability: { select: { module: true, action: true } },
              },
            },
          },
        },
        grantedCapabilities: {
          select: {
            createdAt: true,
            grantedById: true,
            reason: true,
            capability: { select: { module: true, action: true } },
          },
        },
      },
    });

    if (!user) return [];

    const fromRole: EffectiveCapability[] = (
      user.role?.capabilities ?? []
    ).map(({ capability }) => ({
      capability: `${capability.module}:${capability.action}`,
      module: capability.module,
      action: capability.action,
      source: 'ROLE' as const,
      grantedAt: null,
      grantedById: null,
      reason: null,
    }));

    const roleKeys = new Set(fromRole.map((c) => c.capability));

    // Rolde zaten olan bir yetkinin kişisel kaydı listeyi ikizler ve "kaldır"
    // düğmesini yanıltırdı (kaldırsa bile rolden gelmeye devam eder).
    const fromGrant: EffectiveCapability[] = user.grantedCapabilities
      .filter(
        ({ capability }) =>
          !roleKeys.has(`${capability.module}:${capability.action}`)
      )
      .map(({ capability, createdAt, grantedById, reason }) => ({
        capability: `${capability.module}:${capability.action}`,
        module: capability.module,
        action: capability.action,
        source: 'GRANT' as const,
        grantedAt: createdAt,
        grantedById,
        reason,
      }));

    return [...fromRole, ...fromGrant].sort((a, b) =>
      a.capability.localeCompare(b.capability)
    );
  }
}
