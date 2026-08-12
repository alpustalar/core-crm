import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { RoleSlug } from '@src/domain/constants/db/role/role-slugs';
import { Role as IRole } from '@shared';
import { FindBySlugResponse } from '@modules/identity/role/domain/contracts/role.contracts';
import { IRoleQueryRepository } from '@modules/identity/role/domain/repositories/role/role.query.repository';

@Injectable()
export class RoleQueryRepository
  extends BaseRepository
  implements IRoleQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findById(id: string): Promise<IRole | null> {
    return this.db.role.findUnique({ where: { id } });
  }

  findBySlug(slug: RoleSlug): Promise<FindBySlugResponse> {
    return this.db.role.findFirst({
      where: { slug },
      select: { id: true, slug: true },
    });
  }
}
