import { UserRepository } from '@modules/user/infrastructure/persistence/prisma/repositories/user.repository';
import { ActorContext } from '@common/interfaces';
import { Injectable } from '@nestjs/common';
import { PolicyFactory } from '@modules/policy/policy-factory';
import { UpdateUserByActorDto } from '@shared';

type Execute = {
  targetUpdateUserId: string;
  dto: UpdateUserByActorDto;
  actor: ActorContext;
};

@Injectable()
export class UpdateUserByActorUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    protected readonly policyFactory: PolicyFactory
  ) {}

  async execute({ targetUpdateUserId, dto, actor }: Execute) {
    this.policyFactory
      .user(actor)
      .evaluator.check(
        (p) => p.isSelf(targetUpdateUserId),
        'Kendi yetkilerinizi buradan değiştiremezsiniz.'
      )
      .orThrow();

    const targetUser =
      await this.userRepo.findOneWithAnIdOrEmail(targetUpdateUserId);

    this.policyFactory
      .user(actor)
      .evaluator.check(
        (p) => p.isPrivilegedUser(),
        'Bu işlem için yetkili kullanıcı olmalısınız'
      )
      .check(
        (p) => p.hasHigherPriorityThan(targetUser),
        'Hedef kullanıcıdan daha yüksek bir yetkiye sahip olmalısınız'
      )
      .check(
        (p) => p.isTargetInMyClinicForManage(targetUser),
        'Hedef kullanıcı ile aynı klinikte (yönetici olarak) olmalısınız'
      );

    const { clinicId, doctorProfile, ...dataToUpdate } = dto;

    return await this.userRepo.updateUserWithAnId(targetUpdateUserId, {
      ...dataToUpdate,
      ...(clinicId && {
        workingClinic: {
          connect: { id: clinicId },
        },
      }),
      ...(doctorProfile && {
        doctorProfile: {
          upsert: {
            update: {
              title: doctorProfile.title,
              specialty: doctorProfile.specialty,
              publicPhone: doctorProfile.publicPhone,
              clinic: clinicId ? { connect: { id: clinicId } } : undefined,
            },
            create: {
              title: doctorProfile.title,
              specialty: doctorProfile.specialty,
              publicPhone: doctorProfile.publicPhone,
              clinic: { connect: { id: clinicId! } },
            },
          },
        },
      }),
    });
  }
}
