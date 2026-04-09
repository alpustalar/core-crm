import { Injectable } from '@nestjs/common';
import { UserRepository } from '@modules/user/infrastructure/persistence/prisma/repositories/user.repository';
import { UserStatus } from '@prisma/client';

@Injectable()
export class SoftDeleteManyUserForCascadeUseCase {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(clinicId: string) {
    return this.userRepo.changeAllUserStatusInClinicWithClinicId(
      clinicId,
      UserStatus.DELETED
    );
  }
}
