import { UserRepository } from '../../repositories/user.repository';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { ActorContext } from '@common/interfaces';
import { Injectable } from '@nestjs/common';
import { UserUpdateBySelfDto } from '@shared/modules';

@Injectable()
export class UpdateUserBySelfUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(
    data: UserUpdateBySelfDto,
    actor: ActorContext,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;
    return this.userRepo.updateUserWithAnId(actor.userId, data, client);
  }
}
