import { Injectable } from '@nestjs/common';
import { UserRepository } from '@modules/user/repositories/user.repository';
import { Prisma, UserStatus } from '@prisma/client';
import { PrismaService } from '@modules/prisma/prisma.service';

@Injectable()
export class SoftDeleteManyUserForCascadeUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(clinicId: string, tx?: Prisma.TransactionClient) {
    const client = this.prisma ?? tx;
    return this.userRepo.changeAllUserStatusInClinicWithClinicId(
      clinicId,
      UserStatus.DELETED,
      client,
    );
  }
}
