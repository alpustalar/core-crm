import { UserRepository } from '../../repositories/user.repository';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { PaginationParamsDto } from '@common/dto';
import { paginate } from '@common/utils';

import { Injectable } from '@nestjs/common';

@Injectable()
export class FindAllUsersUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(dto: PaginationParamsDto, tx?: Prisma.TransactionClient) {
    const client = tx ?? this.prisma;
    const dtoLimit = dto.limit ?? 10;
    const pagination = paginate(dto.page, dtoLimit);
    const { items, total } = await this.userRepo.findAllUsers(
      pagination,
      undefined,
      client,
    );

    return {
      items,
      meta: {
        total,
        page: dto.page,
        limit: dto.limit,
        totalPages: Math.ceil(total / dtoLimit),
      },
    };
  }
}
