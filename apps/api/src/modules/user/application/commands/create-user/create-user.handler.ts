import { CreateUserCommand } from '@modules/user/application/commands/create-user/create-user.command';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InternalOnly } from '@common/decorators/internal-only.decorator';
import { Inject } from '@nestjs/common';
import {
  IUserRepository,
  USER_REPO_TOKEN,
} from '@modules/user/domain/repositories/user.repository';
import {
  IPolicyFactory,
  POLICY_FACTORY_TOKEN,
} from '@modules/policy/domain/interfaces/policy-factory.interface';
import {
  IUserEventPublisher,
  USER_EVENT_PUBLISHER_TOKEN,
} from '@modules/user/domain/interfaces/user-event-publisher.interface';
import {
  FIREBASE_SERVICE_TOKEN,
  IFirebaseService,
} from '@modules/firebase/domain/interfaces/firebase.service.interface';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction';
import { LogAction, LogType } from '@src/domain/constants/log-action.constant';
import { UserCommandsPrismaMapper } from '@modules/user/infrastructure/persistence/prisma/mappers/user-commands-prisma.mapper';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler
  implements ICommandHandler<CreateUserCommand, string>
{
  constructor(
    @Inject(USER_REPO_TOKEN)
    private readonly userRepo: IUserRepository,
    @Inject(POLICY_FACTORY_TOKEN)
    protected readonly policyFactory: IPolicyFactory,
    @Inject(USER_EVENT_PUBLISHER_TOKEN)
    private readonly userEventPublisher: IUserEventPublisher,
    @Inject(FIREBASE_SERVICE_TOKEN)
    private readonly firebaseService: IFirebaseService,
    private readonly transactionManager: TransactionManager
  ) {}
  @InternalOnly()
  async execute(command: CreateUserCommand) {
    const {
      dto,
      context: { actor },
    } = command;

    const { evaluator } = this.policyFactory.user(actor);

    const clinicId = actor.clinicId ?? dto.clinicId;

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
      const firebaseUser = await this.firebaseService.createUser({
        displayName: dto.displayName,
        email: dto.email,
        password: dto.password,
      });
      firebaseUid = firebaseUser.uid;

      const createdUser = await this.transactionManager.run(async () => {
        const prismaInput = UserCommandsPrismaMapper.toCreateUserInput(
          firebaseUid!,
          dto,
          clinicId
        );

        return this.userRepo.createUser(prismaInput);
      });

      return createdUser.id;
    } catch (error) {
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
  }
}
