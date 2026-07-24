import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { ActorContext } from '@common/interfaces';
import {
  FIREBASE_SERVICE,
  IFirebaseService,
} from '@src/infrastructure/firebase/firebase.service.interface';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { ConvertUserToProviderCommand } from '@modules/clinical/provider/application/commands';
import { CreateUserCommand } from '@modules/identity/user/application/commands/create-user/create-user.command';
import { CreateUserResponse } from '@modules/identity/user/application/commands/create-user/create-user.response';
import {
  IUserEventPublisher,
  USER_EVENT_PUBLISHER,
} from '@modules/identity/user/domain/interfaces/user-event-publisher.interface';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateProviderDto, RegisterUserOrProviderAccountDto } from '@shared';
import { ExecutionContextFactory } from '@src/domain/common/execution/execution-context.factory';
import { LogType } from '@src/domain/constants/log-action.constant';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction';
import { USER_EVENTS } from '@src/domain/constants/events';
import { RegisterUserOrProviderAccountCommand } from '@modules/identity/auth/registration/application/commands/register-user-or-provider-account/register-user-or-provider-account.command';
import { RegistrationConfigurationException } from '@modules/identity/auth/registration/domain/registration.exceptions';

@CommandHandler(RegisterUserOrProviderAccountCommand)
export class RegisterUserOrProviderAccountHandler
  implements
    ICommandHandler<RegisterUserOrProviderAccountCommand, CreateUserResponse>
{
  constructor(
    @Inject(POLICY_FACTORY)
    protected readonly policyFactory: IPolicyFactory,
    @Inject(USER_EVENT_PUBLISHER)
    private readonly userEventPublisher: IUserEventPublisher,
    @Inject(FIREBASE_SERVICE)
    private readonly firebaseService: IFirebaseService,
    private readonly commandBus: TSCommandBus,
    private readonly transactionManager: TransactionManager
  ) {}

  async execute(
    command: RegisterUserOrProviderAccountCommand
  ): Promise<string> {
    const {
      data,
      ctx: { actor, source },
      internalRelations,
    } = command.payload;

    this.policyFactory
      .user(actor, source)
      .evaluator.bypassIf(!data.roleId)
      .check(
        (p) => p.isTargetInActorsManagedClinic(data.clinicId),
        'Yetki ihlali: Bu işlem için gerekli izinlere sahip değilsiniz.'
      )
      .orThrow(USER_EVENTS.CREATE);

    let firebaseUid: string | undefined;

    try {
      ({ firebaseUid } = await this.createFirebaseUser(data));
      await this.transactionManager.run(async () => {
        if (!firebaseUid)
          throw new RegistrationConfigurationException(
            'Firebase servisinden id gönderimi sağlanmadı'
          );

        await this.commandBus.execute(
          new CreateUserCommand(
            {
              ...data,
              firebaseUid,
              ownedOrganizationIds: internalRelations?.ownedOrganizationIds,
              managedClinicIds: internalRelations?.managedClinicIds,
            },
            ExecutionContextFactory.createInternal()
          )
        );
        return firebaseUid;
      });

      if (data.providerProfile && data.clinicId) {
        await this.createProviderProfile(
          firebaseUid,
          data.clinicId,
          data.providerProfile
        );
      }

      return firebaseUid;
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
        ExecutionContextFactory.createInternal(),
        {
          userId,
          titleId: providerTitleId!,
          specialtyId: providerSpecialtyId!,
          clinicId,
          publicPhone,
          publicEmail,
          isActive,
          acceptsConsultation: profileDto.acceptsConsultation,
          operationMode: profileDto.operationMode,
        }
      )
    );
  }

  private async createFirebaseUser(
    data: RegisterUserOrProviderAccountDto
  ): Promise<{ firebaseUid: string }> {
    const firebaseUser = await this.firebaseService.createUser({
      displayName: data.displayName,
      email: data.email,
      password: data.password,
    });
    return { firebaseUid: firebaseUser.uid };
  }
}
