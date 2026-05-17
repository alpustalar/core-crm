import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, InternalServerErrorException } from '@nestjs/common';
import type { CreateUser } from '@shared';
import { RegisterClinicAccountCommand } from './register-clinic-account.command';
import {
  FIREBASE_SERVICE_TOKEN,
  IFirebaseService,
} from '@modules/firebase/domain/interfaces/firebase.service.interface';
import {
  IUserModuleApi,
  USER_MODULE_API_TOKEN,
} from '@modules/user/domain/interfaces/user.module.api.interface';
import {
  CLINIC_MODULE_API_TOKEN,
  IClinicModuleApi,
} from '@modules/clinic/domain/interfaces/clinic.module.api.interface';
import {
  IRoleModuleApi,
  ROLE_MODULE_API_TOKEN,
} from '@modules/role/domain/interfaces/role.module.api.interface';
import {
  IOrganizationModuleApi,
  ORGANIZATION_MODULE_API_TOKEN,
} from '@modules/organization/domain/interfaces/organization.module.api.interface';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction';
import { ExecutionContextFactory } from '@src/domain/common/execution/execution-context.factory';
import { ExecutionSources } from '@src/domain/constants/execution-source.constant';
import { ROLE_SLUGS } from '@src/domain/constants/db/role/role-slugs';

@CommandHandler(RegisterClinicAccountCommand)
export class RegisterClinicAccountHandler
  implements ICommandHandler<RegisterClinicAccountCommand>
{
  constructor(
    @Inject(FIREBASE_SERVICE_TOKEN)
    private readonly firebaseService: IFirebaseService,
    @Inject(USER_MODULE_API_TOKEN)
    private readonly userModuleApi: IUserModuleApi,
    @Inject(CLINIC_MODULE_API_TOKEN)
    private readonly clinicModuleApi: IClinicModuleApi,
    @Inject(ROLE_MODULE_API_TOKEN)
    private readonly roleModuleApi: IRoleModuleApi,
    @Inject(ORGANIZATION_MODULE_API_TOKEN)
    private readonly organizationModuleApi: IOrganizationModuleApi,
    private readonly transactionManager: TransactionManager
  ) {}

  async execute(command: RegisterClinicAccountCommand) {
    const { dto } = command;
    const { organization, clinic, owner } = dto;

    const role = await this.roleModuleApi.getBySlug(ROLE_SLUGS.CLINIC_OWNER);

    const internalCtx = ExecutionContextFactory.createInternal(
      ExecutionSources.INTERNAL_CASCADE
    );

    let firebaseUid: string | undefined;

    try {
      const firebaseUser = await this.firebaseService.createUser({
        displayName: owner.displayName,
        email: owner.email,
        password: owner.password,
      });
      firebaseUid = firebaseUser.uid;

      await this.transactionManager.run(async () => {
        const result = await this.organizationModuleApi.create(organization);

        if (!result?.id) {
          throw new InternalServerErrorException('Organizasyon oluşturulamadı');
        }

        const clinicId = await this.clinicModuleApi.create(
          { ...clinic, organizationId: result.id },
          internalCtx
        );

        if (!clinicId) {
          throw new InternalServerErrorException('Klinik oluşturulamadı');
        }

        const userDto: CreateUser = {
          email: owner.email,
          displayName: owner.displayName,
          password: owner.password,
          picture: owner.picture,
          roleId: role.id,
          clinicId,
        };

        await this.userModuleApi.create(userDto, internalCtx, {
          firebaseUid,
          ownedOrganizationIds: [result.id],
          managedClinicIds: [clinicId],
        });
      });
    } catch (error) {
      if (firebaseUid) {
        await this.firebaseService.deleteUser(firebaseUid).catch(() => {});
      }
      throw error;
    }
  }
}
