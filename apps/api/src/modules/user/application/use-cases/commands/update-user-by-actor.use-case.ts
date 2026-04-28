import { UserRepository } from '@modules/user/infrastructure/persistence/prisma/repositories/user.repository';
import { ActorContext } from '@common/interfaces';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PolicyFactory } from '@modules/policy/policy-factory';
import { UpdateUserByActorDto } from '@shared';
import { connect } from '@src/infrastructure/persistence/prisma/data';

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

    const { clinicId, titleId, specialtyId, providerProfile, ...dataToUpdate } =
      dto;

    if (providerProfile && !clinicId) {
      throw new BadRequestException(
        "'Provider profil oluşturmak için Klinik ID zorunludur.'"
      );
    }

    return this.userRepo.updateUserWithAnId(targetUpdateUserId, {
      ...dataToUpdate,
      workingClinic: connect(clinicId),
      ...(providerProfile && {
        providerProfile: {
          ...(clinicId
            ? {
                upsert: {
                  update: {
                    publicPhone: providerProfile.publicPhone,
                    title: connect(titleId),
                    specialty: connect(specialtyId),
                    clinic: connect(clinicId),
                  },
                  create: {
                    publicPhone: providerProfile.publicPhone,
                    title: connect(titleId),
                    specialty: connect(specialtyId),
                    clinic: { connect: { id: clinicId } },
                  },
                },
              }
            : {
                update: {
                  publicPhone: providerProfile.publicPhone,
                  title: connect(titleId),
                  specialty: connect(specialtyId),
                },
              }),
        },
      }),
    });
  }
}
