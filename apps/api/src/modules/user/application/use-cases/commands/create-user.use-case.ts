import { UserRepository } from '@modules/user/infrastructure/persistence/prisma/repositories/user.repository';
import { FirebaseService } from '@modules/firebase/firebase.service';
import { User } from '@prisma/client';
import { TransactionSaga } from '@common/patterns/saga';
import { auth } from 'firebase-admin';
import { AuditLogService } from '@modules/audit-log/audit-log.service';
import { AuditAction } from '@modules/audit-log/enums/audit-action.enum';
import { ActorContext } from '@common/interfaces';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PolicyFactory } from '@modules/policy/policy-factory';
import { CreateUserDto } from '@shared';

@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly firebaseService: FirebaseService,
    private readonly auditLog: AuditLogService,
    protected readonly policyFactory: PolicyFactory
  ) {}

  async execute(dto: CreateUserDto, actor: ActorContext): Promise<User> {
    const { policy: userPolicy, evaluator: userEvaluator } =
      this.policyFactory.user(actor);
    let clinicId: string | undefined = dto.clinicId;

    if (!clinicId && !userPolicy.isSystemAdmin()) {
      clinicId = actor.clinicId;
    }

    if (dto.roleId) {
      userEvaluator
        .check(
          (p) => p.canManagePartialUser(clinicId!),
          'Bu rolü atamaya yetkiniz yok'
        )
        .orThrow();
    }

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
        }
      );

      saga.addStep(
        async () => {
          prismaUser = await this.userRepo.createUser({
            id: firebaseUser!.uid,
            email: dto.email,
            displayName: dto.displayName,
            workingClinic: clinicId ? { connect: { id: clinicId } } : undefined,
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
          });
          return prismaUser;
        },
        async () => Promise.resolve()
      );

      await saga.execute();

      if (!prismaUser) {
        throw new NotFoundException('Kullanıcı oluşturulamadı');
      }

      return prismaUser;
    } catch (error) {
      await saga.compensate();
      throw error;
    }
  }

  async log(details: string, actor: ActorContext) {
    return await this.auditLog.log({
      action: AuditAction.USER_REGISTER,
      source: actor.source,
      details: `${details}. Clinic id: ${actor?.clinicId}`,
      userId: actor?.userId,
    });
  }
}
