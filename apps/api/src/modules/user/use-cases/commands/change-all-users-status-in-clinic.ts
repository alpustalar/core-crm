import { Injectable } from '@nestjs/common';
import { Prisma, UserStatus } from '@prisma/client';
import { PrismaService } from '@modules/prisma/prisma.service';
import { ActorContext } from '@common/interfaces';
import { UserRepository } from '@modules/user/repositories/user.repository';

@Injectable()
export class ChangeAllUsersStatusInClinic {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userRepo: UserRepository,
  ) {}

  async execute(
    clinicId: string,
    status: UserStatus,
    actor: ActorContext,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;

    await this.userRepo.changeAllUserStatusInClinicWithClinicId(
      clinicId,
      status,
      client,
    );
  }
}
