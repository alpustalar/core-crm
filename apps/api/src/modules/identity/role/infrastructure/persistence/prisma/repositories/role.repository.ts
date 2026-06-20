import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { RoleSlug } from '@src/domain/constants/db/role/role-slugs';
import { IRoleRepository } from '@modules/identity/role/domain/repositories/role.repository.interface';
import { Role } from '@modules/identity/role/domain/entities/role.entity';
import { FindBySlugResponse } from '@modules/identity/role/domain/role.contracts';

@Injectable()
export class RoleRepository extends BaseRepository implements IRoleRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string): Promise<Role | null> {
    const raw = await this.db.role.findUnique({
      where: { id },
      include: {
        capabilities: { include: { capability: true } },
      },
    });
    return raw ? new Role(raw) : null;
  }

  findBySlug(slug: RoleSlug): Promise<FindBySlugResponse> {
    return this.db.role.findFirst({
      where: { slug },
      select: { id: true, slug: true },
    });
  }
}
