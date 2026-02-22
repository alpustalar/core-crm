import { UserPolicy } from './user.policy';
import { ActorContext } from '@common/interfaces';
import { User } from '@prisma/client';
import { ForbiddenException } from '@nestjs/common';
import { AuditLogService } from '@modules/audit-log/audit-log.service';
import {
  AuditAction,
  AuditSource,
} from '@modules/audit-log/enums/audit-action.enum';
import { UpdateUserByActorDto } from '@shared/modules';

export class UpdateUserByActorPolicy extends UserPolicy {
  constructor(
    protected actor: ActorContext,
    private readonly targetUser: User,
    private readonly dto: UpdateUserByActorDto,
    protected readonly auditLogService: AuditLogService,
  ) {
    super(actor, auditLogService);
  }

  validateOrThrow() {
    this.checkSelfUpdateRestriction();
    this.checkHierarchyProtection();
    this.checkPrivilegedFields();
  }

  private logAndThrow(error: string) {
    this.auditLogService
      .log(
        AuditAction.SECURITY_VIOLATION,
        AuditSource.WEB,
        `user:update. violation: ${error} (Target: ${this.targetUser.id})`,
        this.actor.userId,
      )
      .catch(() => null);

    throw new ForbiddenException(error);
  }

  private checkSelfUpdateRestriction() {
    if (this.isSelf(this.targetUser.id) && !this.isSystemAdmin()) {
      this.logAndThrow('Kendi yetkilerinizi buradan değiştiremezsiniz.');
    }
  }

  private checkHierarchyProtection() {
    if (this.targetRoleHasHigherOrEqual(this.targetUser)) {
      this.logAndThrow('Eş değer veya üst seviyeye müdahale edemezsiniz.');
    }
  }

  private checkPrivilegedFields() {
    if (this.dto.roleId || this.dto.status) {
      if (!this.isPrivilegedUser()) {
        this.logAndThrow('Rol veya statü değişikliği için yetkiniz yetersiz.');
      }

      if (this.dto.roleId && this.hasHigherPriorityThan(this.targetUser)) {
        this.logAndThrow(
          'Kendi yetki seviyenizden yüksek bir rol atayamazsınız.',
        );
      }
    }
  }
}
