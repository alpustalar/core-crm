import {
  FIREBASE_SERVICE,
  IFirebaseService,
} from '@modules/firebase/domain/interfaces/firebase.service.interface';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/policy/domain/interfaces/policy-factory.interface';
import { CreateUserCommand } from '@modules/user/application/commands/create-user/create-user.command';
import {
  IUserEventPublisher,
  USER_EVENT_PUBLISHER,
} from '@modules/user/domain/interfaces/user-event-publisher.interface';
import {
  IUserCommandRepository,
  USER_COMMAND_REPOSITORY,
} from '@modules/user/domain/repositories/user.repository';
import { Inject, InternalServerErrorException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ExecutionPolicy } from '@src/domain/common/execution/execution.policy';
import { LogAction, LogType } from '@src/domain/constants/log-action.constant';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction';
import { CreateProviderDto, CreateUserDto } from '@shared';
import { ActorContext } from '@common/interfaces';
import { CreateUserResponse } from '@modules/user/application/commands/create-user/create-user.response';
import { CreateUserInternalRelations } from '@modules/user/domain/types/create-user-internal-relations.type';
import { ConvertUserToProviderCommand } from '@modules/provider/application/commands';
import { ExecutionContextFactory } from '@src/domain/common/execution/execution-context.factory';
import { ExecutionSources } from '@src/domain/constants/execution-source.constant';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler
  implements ICommandHandler<CreateUserCommand, CreateUserResponse>
{
  constructor(
    @Inject(USER_COMMAND_REPOSITORY)
    private readonly userRepo: IUserCommandRepository,
    @Inject(POLICY_FACTORY)
    protected readonly policyFactory: IPolicyFactory,
    @Inject(USER_EVENT_PUBLISHER)
    private readonly userEventPublisher: IUserEventPublisher,
    @Inject(FIREBASE_SERVICE)
    private readonly firebaseService: IFirebaseService,
    private readonly commandBus: TSCommandBus,
    private readonly transactionManager: TransactionManager
  ) {}

  async execute(command: CreateUserCommand): Promise<CreateUserResponse> {
    const {
      dto,
      ctx: { actor, source },
      internalRelations,
    } = command;
    const clinicId = actor.clinicId ?? dto.clinicId;

    if (ExecutionPolicy.isSystemInitiated(source)) {
      let firebaseUid: string | undefined;

      try {
        const firebaseResult = await this.createFirebaseUser(dto);
        firebaseUid = firebaseResult.firebaseUid;
        const uid = firebaseUid;
        await this.transactionManager.run(async () => {
          const user = await this.createUser({
            dto,
            clinicId,
            internalRelations,
            firebaseUid: uid,
          });

          if (dto.providerProfile && clinicId) {
            await this.createProviderProfile(
              user.id,
              clinicId,
              dto.providerProfile
            );
          }

          return { id: user.id };
        });
      } catch (e) {
        this.rollback(actor, e, firebaseUid);
      }
    }

    const { evaluator } = this.policyFactory.user(actor);

    if (dto.roleId && clinicId) {
      evaluator
        .check(
          (p) => p.isTargetInActorsManagedClinic(clinicId),
          'Yetki ihlali: Bu işlem için gerekli izinlere sahip değilsiniz.'
        )
        .orThrow((msg) => {
          this.userEventPublisher.create({
            action: LogAction.USER_REGISTER,
            actorId: actor.userId,
            details: msg,
            source: actor.source,
            type: LogType.SECURITY,
          });
        });
    }

    let firebaseUid: string | undefined;

    try {
      const firebaseResult = await this.createFirebaseUser(dto);
      firebaseUid = firebaseResult.firebaseUid;

      await this.transactionManager.run(async () => {
        const user = await this.createUser({
          dto,
          clinicId,
          firebaseUid: firebaseUid!,
        });

        if (dto.providerProfile && clinicId) {
          await this.createProviderProfile(
            user.id,
            clinicId,
            dto.providerProfile
          );
        }
      });
    } catch (e) {
      this.rollback(actor, e, firebaseUid);
    }
  }

  private async createUser({
    dto,
    internalRelations,
    firebaseUid,
    clinicId,
  }: {
    dto: CreateUserDto;
    clinicId?: string;
    firebaseUid: string;
    internalRelations?: CreateUserInternalRelations;
  }) {
    if (!firebaseUid) {
      throw new InternalServerErrorException('Firebase Uid bulunamadı');
    }

    return await this.userRepo.create({
      id: firebaseUid,
      email: dto.email,
      displayName: dto.displayName,
      picture: dto.picture,
      roleId: dto.roleId,
      clinicId,
      ownedOrganizationIds: internalRelations?.ownedOrganizationIds,
      managedClinicIds: internalRelations?.managedClinicIds,
    });
  }

  private rollback(
    actor: ActorContext,
    error: any,
    firebaseUid?: string
  ): never {
    if (firebaseUid) {
      this.userEventPublisher.enqueueForceDelete({
        firebaseUid,
        actorId: actor.userId,
        source: actor.source,
        type: LogType.ERROR,
      });
    }
    throw error;
  }

  private async createProviderProfile(
    userId: string,
    clinicId: string,
    profileDto: CreateProviderDto
  ) {
    const {
      providerSpecialtyId,
      providerTitleId,
      publicPhone,
      publicEmail,
      isActive,
    } = profileDto;

    await this.commandBus.execute(
      new ConvertUserToProviderCommand(
        ExecutionContextFactory.createInternal(
          ExecutionSources.INTERNAL_CASCADE
        ),
        {
          userId,
          titleId: providerTitleId!,
          specialtyId: providerSpecialtyId!,
          clinicId,
          publicPhone,
          publicEmail,
          isActive,
        }
      )
    );
  }

  private async createFirebaseUser(
    dto: CreateUserDto
  ): Promise<{ firebaseUid: string }> {
    const firebaseUser = await this.firebaseService.createUser({
      displayName: dto.displayName,
      email: dto.email,
      password: dto.password,
    });

    return {
      firebaseUid: firebaseUser.uid,
    };
  }
}
