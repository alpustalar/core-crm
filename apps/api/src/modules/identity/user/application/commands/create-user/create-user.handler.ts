import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { ActorContext } from '@common/interfaces';
import {
  FIREBASE_SERVICE,
  IFirebaseService,
} from '@modules/identity/auth/firebase/domain/interfaces/firebase.service.interface';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/domain/interfaces/policy-factory.interface';
import { ConvertUserToProviderCommand } from '@modules/clinical/provider/application/commands';
import { CreateUserCommand } from '@modules/identity/user/application/commands/create-user/create-user.command';
import { CreateUserResponse } from '@modules/identity/user/application/commands/create-user/create-user.response';
import {
  IUserEventPublisher,
  USER_EVENT_PUBLISHER,
} from '@modules/identity/user/domain/interfaces/user-event-publisher.interface';
import {
  IUserCommandRepository,
  USER_COMMAND_REPOSITORY,
} from '@modules/identity/user/domain/repositories/user.repository';
import { User } from '@modules/identity/user/domain/entities/user.entity';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateProviderDto, CreateUserDto } from '@shared';
import { ExecutionContextFactory } from '@src/domain/common/execution/execution-context.factory';
import { ExecutionPolicy } from '@src/domain/common/execution/execution.policy';
import { ExecutionSources } from '@src/domain/constants/execution-source.constant';
import { LogAction, LogType } from '@src/domain/constants/log-action.constant';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction';

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

  async execute(command: CreateUserCommand): Promise<string> {
    const {
      dto,
      ctx: { actor, source },
      internalRelations,
    } = command;
    const clinicId = actor.clinicId ?? dto.clinicId;

    if (!ExecutionPolicy.isSystemInitiated(source) && dto.roleId && clinicId) {
      const { evaluator } = this.policyFactory.user(actor);
      await evaluator
        .check(
          (p) => p.isTargetInActorsManagedClinic(clinicId),
          'Yetki ihlali: Bu işlem için gerekli izinlere sahip değilsiniz.'
        )
        .orAsyncThrow(async (msg) => {
          // eslint-disable-next-line
          await this.transactionManager.run(async () => {
            this.userEventPublisher.create({
              action: LogAction.USER_REGISTER,
              actorId: actor.userId,
              details: msg,
              source: actor.source,
              type: LogType.SECURITY,
            });
          });
        });
    }

    let firebaseUid: string | undefined;

    try {
      ({ firebaseUid } = await this.createFirebaseUser(dto));

      const userId = await this.transactionManager.run(async () => {
        const user = User.create({
          id: firebaseUid!,
          email: dto.email,
          displayName: dto.displayName,
          picture: dto.picture,
          roleId: dto.roleId,
          clinicId,
          ownedOrganizationIds: internalRelations?.ownedOrganizationIds,
          managedClinicIds: internalRelations?.managedClinicIds,
        });

        const saved = await this.userRepo.save(user);
        return saved.id;
      });

      if (dto.providerProfile && clinicId) {
        await this.createProviderProfile(userId, clinicId, dto.providerProfile);
      }

      return userId;
    } catch (e) {
      this.rollback(actor, e, firebaseUid);
    }
  }

  private rollback(
    actor: ActorContext,
    error: unknown,
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
    return { firebaseUid: firebaseUser.uid };
  }
}
