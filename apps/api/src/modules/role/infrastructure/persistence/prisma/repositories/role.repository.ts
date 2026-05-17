import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { RoleSlug } from '@src/domain/constants/db/role/role-slugs';
import { IRoleRepository } from '@modules/role/domain/repositories/role.repository.interface';
import { GetRoleBySlugResponse } from '@modules/role/application/queries/get-role-by-slug/get-role-by-slug.response';

@Injectable()
export class RoleRepository extends BaseRepository implements IRoleRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findBySlug(slug: RoleSlug): Promise<GetRoleBySlugResponse> {
    return this.db.role.findFirstOrThrow({
      where: { slug },
      select: { id: true, slug: true },
    });
  }
}
