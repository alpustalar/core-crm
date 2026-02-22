import { UserRepository } from '../../repositories/user.repository';
import { FirebaseService } from '../../../firebase/firebase.service';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { TransactionSaga } from '@common/patterns/saga';
import { auth } from 'firebase-admin';
import { AuditLogService } from '../../../audit-log/audit-log.service';
import {
  AuditAction,
  AuditSource,
} from '../../../audit-log/enums/audit-action.enum';
import { ActorContext } from '@common/interfaces';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { PolicyFactory } from '@common/policy/factory.policy';
import { CreateUserDto } from '@shared/modules';

@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly firebaseService: FirebaseService,
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
    protected readonly policyFactory: PolicyFactory,
  ) {}

  async execute(
    dto: CreateUserDto,
    actor: ActorContext,
    tx?: Prisma.TransactionClient,
  ): Promise<User> {
    const policy = this.policyFactory.user(actor);

    let clinicId: string | undefined = dto.clinicId;

    if (!clinicId && !policy.isSystemAdmin()) {
      clinicId = actor.clinicId;
    }

    if (dto.roleId) {
      if (!policy.canManagePartialUser(clinicId)) {
        throw new ForbiddenException('Bu rolü atamaya yetkiniz yok');
      }
    }

    const client = tx ?? this.prisma;
    const saga = new TransactionSaga();

    let firebaseUser: auth.UserRecord | undefined = undefined;
    let prismaUser: User | undefined = undefined;

    const { displayName, password, email } = dto;

    try {
      saga.addStep(
        async () => {
          firebaseUser = await this.firebaseService.createUser({
            displayName,
            email,
            password,
          });
          return firebaseUser;
        },
        async () => {
          if (firebaseUser?.uid) {
            await this.firebaseService.deleteUser(firebaseUser.uid);
            await this.log('FirebaseRecord', actor);
          }
        },
      );

      saga.addStep(
        async () => {
          prismaUser = await this.userRepo.createUser(
            {
              id: firebaseUser!.uid,
              email: dto.email,
              displayName: dto.displayName,
              workingClinic: clinicId
                ? { connect: { id: clinicId } }
                : undefined,
              role: dto.roleId ? { connect: { id: dto.roleId } } : undefined,
              doctorProfile: dto.doctorProfile
                ? {
                    create: {
                      title: dto.doctorProfile.title,
                      specialty: dto.doctorProfile.specialty,
                      publicEmail: dto.doctorProfile.publicEmail,
                      publicPhone: dto.doctorProfile.publicPhone,
                      isActive: dto.doctorProfile.isActive,
                      clinic: {
                        connect: { id: clinicId },
                      },
                    },
                  }
                : undefined,
            },
            client,
          );
          return prismaUser;
        },
        async () => Promise.resolve(),
      );

      await saga.execute();

      if (!prismaUser) {
        throw new Error('Kullanıcı oluşturulamadı');
      }

      return prismaUser;
    } catch (error) {
      await saga.compensate();
      throw error;
    }
  }

  async log(details: string, actor: ActorContext) {
    return await this.auditLog.log(
      AuditAction.USER_REGISTER_FAILED,
      AuditSource.WEB,
      `${details}. Clinic id: ${actor?.clinicId}`,
      actor?.userId,
    );
  }
}
