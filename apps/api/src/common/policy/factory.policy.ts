import { Injectable } from '@nestjs/common';
import { AuditLogService } from '@modules/audit-log/audit-log.service';
import { ActorContext } from '@common/interfaces';
import { OrganizationPolicy } from '@modules/organization/policies/organization.policy';
import { UpdateUserByActorPolicy, UserPolicy } from '@modules/user/policies';
import { ClinicPolicy } from '@modules/clinic/policies';
import { User } from '@prisma/client';
import { UpdateUserByActorDto } from '@shared/modules';

@Injectable()
export class PolicyFactory {
  constructor(protected readonly auditLogService: AuditLogService) {}

  organization(actor: ActorContext) {
    return new OrganizationPolicy(actor, this.auditLogService);
  }

  user(actor: ActorContext) {
    return new UserPolicy(actor, this.auditLogService);
  }

  updateUserByActor(
    actor: ActorContext,
    targetUser: User,
    dto: UpdateUserByActorDto,
  ) {
    return new UpdateUserByActorPolicy(
      actor,
      targetUser,
      dto,
      this.auditLogService,
    );
  }

  clinic(actor: ActorContext) {
    return new ClinicPolicy(actor, this.auditLogService);
  }
}
