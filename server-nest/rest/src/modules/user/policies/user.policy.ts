import { ActorContext } from '@common/interfaces';
import { User } from '@prisma/client';
import { AuditLogService } from '@modules/audit-log/audit-log.service';
import { ForbiddenException } from '@nestjs/common';

interface HasClinic {
  clinicId?: string | null;
}

interface HasRole {
  priority: number;
  role?: {
    priority: number;
  };
}

interface HasPriority {
  priority: number;
}

export class UserPolicy {
  // Cache
  private actorCapabilities: string[];
  private actorPriority: number;

  constructor(
    protected readonly actor: ActorContext,
    protected auditLog: AuditLogService,
  ) {
    this.actorCapabilities = actor.capabilities || [];
    this.actorPriority = actor.rolePriority ?? 0;
  }

  //? ==========================================
  //? CORE CHECKS (Sync - Fast)
  //? ==========================================

  /**
   * System admin kontrolü
   */
  isSystemAdmin(): boolean {
    return !!(this.actor.role?.isSystemRole && this.actorPriority >= 100);
  }

  /**
   * Kullanıcının kendisi mi?
   */
  isSelf(targetUserId: string): boolean {
    return this.actor.userId === targetUserId;
  }

  isSelfOrThrow(targetUserId: string) {
    if (!this.isAllowed(this.isSelf(targetUserId))) {
      this.throw();
    }
  }

  /**
   * Hedef kendi yönettiği clinic'lerden birinde mi? (Manage için)
   */
  isTargetInMyClinicForManage(target?: HasClinic): boolean {
    if (!target?.clinicId) return false;

    return !!this.actor.managedClinics?.some(
      (clinic) => clinic.id === target.clinicId,
    );
  }

  isTargetInMyClinicForManageOrThrow(target: HasClinic) {
    if (!this.isAllowed(!this.isTargetInMyClinicForManage(target))) {
      this.throw();
    }
  }

  /**
   * Hedef kendi çalıştığı clinic'te mi? (Read için)
   */
  isTargetInMyClinicForRead(target: HasClinic | null | undefined): boolean {
    return this.actor.clinicId === target?.clinicId;
  }

  isTargetInMyClinicForReadOrThrow(target: HasClinic | null | undefined) {
    if (this.isAllowed(this.isTargetInMyClinicForRead(target))) {
      this.throw();
    }
  }

  /**
   * Privileged user mu? (Priority >= 80)
   */
  isPrivilegedUser(): boolean {
    return this.actorPriority >= 80;
  }

  /**
   * Actor'ın priority'si hedeften yüksek mi?
   *
   * NOT: Target User objesi geldiğinde user.role.priority kullanılır
   * Eğer sadece roleId gelirse AuthGuard'da include edilmediği için
   * kesin kontrol yapılamaz, bu durumda controller'da target user'ı
   * role bilgisiyle birlikte yüklemelisin
   */
  hasHigherPriorityThan(target: User | HasRole): boolean {
    // System admin her zaman yüksek
    if (this.isSystemAdmin()) return true;

    let targetPriority = 0;

    if ('role' in target && target.role) {
      targetPriority = target.role?.priority;
    } else if ('priority' in target && target.priority !== undefined) {
      targetPriority = target.priority;
    }

    if (this.actorPriority === targetPriority) return false;

    return this.actorPriority > targetPriority;
  }

  /**
   * Priority eşit veya düşük mü?
   */
  targetRoleHasHigherOrEqual(target: User | HasPriority): boolean {
    return !this.hasHigherPriorityThan(target);
  }

  //? ==========================================
  //? PRIORITY CHECKS (Cached)
  //? ==========================================

  /**
   * Partial user yönetimi (Create sırasında clinic kontrolü)
   */
  canManagePartialUser(clinicId?: string) {
    if (this.isSystemAdmin()) return true;
    if (clinicId && !this.isTargetInMyClinicForManage({ clinicId })) {
      return false;
    }
  }

  /**
   * Kullanıcıyı tamamen yönetebilir mi? (Update/Delete)
   *
   * NOT: targetUser.role included olmalı (priority için)
   */
  canManageUser(targetUser: User): boolean {
    if (this.isSystemAdmin()) return true;
    if (!this.isTargetInMyClinicForManage({ clinicId: targetUser.clinicId })) {
      return false;
    }
    return this.hasHigherPriorityThan(targetUser);
  }

  //? ==========================================
  //? BUSINESS LOGIC (Main Policy Methods)
  //? ==========================================

  /**
   * Kullanıcıyı silebilir mi?
   */
  canDeleteUser(targetUser: User): boolean {
    if (this.isSystemAdmin()) return true;
    if (this.isSelf(targetUser.id)) {
      return false;
    }
    return this.canManageUser(targetUser);
  }

  /**
   * Kullanıcının rolünü değiştirebilir mi?
   *
   * NOT: Hem targetUser.role hem newRole.priority gerekli
   */
  canChangeUserRole(targetUser: User, newRolePriority: number): boolean {
    if (!this.canManageUser(targetUser)) {
      return false;
    }

    return this.hasHigherPriorityThan({ priority: newRolePriority });
  }

  /**
   * Actor bilgisi summary (debugging için)
   */
  getActorSummary() {
    return {
      userId: this.actor.userId,
      roleId: this.actor.roleId,
      roleName: this.actor.role?.name,
      roleSlug: this.actor.role?.slug,
      priority: this.actorPriority,
      capabilities: this.actorCapabilities,
      isSystemAdmin: this.isSystemAdmin(),
    };
  }

  //? ==========================================
  //? UTILITY METHODS
  //? ==========================================

  protected isAllowed(check: boolean): boolean {
    return check || this.isSystemAdmin();
  }

  private throw = (error?: string) => {
    throw new ForbiddenException('Yetki yetersiz. ' + (error || ''));
  };
}
