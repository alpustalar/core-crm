import { UserRepository } from '../../repositories/user.repository';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { ActorContext } from '@common/interfaces';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { PolicyFactory } from '@common/policy/factory.policy';
import { UpdateUserByActorDto } from '@shared/modules';

@Injectable()
export class UpdateUserByActorUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly prisma: PrismaService,
    protected readonly policyFactory: PolicyFactory,
  ) {}

  async execute(
    targetUpdateUserId: string,
    dto: UpdateUserByActorDto,
    actor: ActorContext,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;

    const userPolicy = this.policyFactory.user(actor);

    if (userPolicy.isSelf(targetUpdateUserId) && !userPolicy.isSystemAdmin()) {
      throw new ForbiddenException(
        'Kendi yetkilerinizi buradan değiştiremezsiniz.',
      );
    }
    const targetUser = await this.userRepo.findOneWithAnIdOrEmail(
      targetUpdateUserId,
      client,
    );

    this.policyFactory
      .updateUserByActor(actor, targetUser, dto)
      .validateOrThrow();

    const { clinicId, doctorProfile, ...dataToUpdate } = dto;

    return await this.userRepo.updateUserWithAnId(
      targetUpdateUserId,
      {
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
      },
      client,
    );
  }
}
