import { Injectable } from '@nestjs/common';
import { SoftDeleteManyUserForCascadeUseCase } from '@modules/user/application/use-cases';

@Injectable()
export class UserModuleApi {
  constructor(
    private readonly softDeleteManyUserForCascadeUseCase: SoftDeleteManyUserForCascadeUseCase
  ) {}

  async softDeleteManyUserForCascade(clinicId: string) {
    return await this.softDeleteManyUserForCascadeUseCase.execute(clinicId);
  }
}
