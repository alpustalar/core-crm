import { UserRepository } from '@modules/user/infrastructure/persistence/prisma/repositories/user.repository';
import { PaginationDto } from '@shared/common/pagination';

import { Injectable } from '@nestjs/common';

@Injectable()
export class FindAllUsersUseCase {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(dto: PaginationDto) {
    const { items, total } = await this.userRepo.findAllUsers(dto);
    const currentPage = Math.floor(dto.skip / dto.take) + 1;
    return {
      items,
      meta: {
        total,
        page: currentPage,
        limit: dto.take,
        totalPages: Math.ceil(total / dto.take),
      },
    };
  }
}
