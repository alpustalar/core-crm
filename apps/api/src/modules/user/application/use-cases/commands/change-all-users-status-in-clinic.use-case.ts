import { Injectable } from '@nestjs/common';
import { UserStatus } from '@prisma/client';
import { UserRepository } from '@modules/user/infrastructure/persistence/prisma/repositories/user.repository';

@Injectable()
export class ChangeAllUsersStatusInClinicUseCase {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(clinicId: string, status: UserStatus) {
    await this.userRepo.changeAllUserStatusInClinicWithClinicId(
      clinicId,
      status
    );
  }
}
