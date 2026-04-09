import { User } from '@prisma/client';
import { BasePolicy } from '@modules/policy';
import { ActorContext } from '@common/interfaces';

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

export class UserPolicy extends BasePolicy {
  private readonly actorCapabilities: string[];

  constructor(actor: ActorContext) {
    super(actor);
    this.actorCapabilities = actor.capabilities || [];
  }
  /**
   * Kullanıcının kendisi mi?
   */
  isSelf(targetUserId: string): boolean {
    return this.actor.userId === targetUserId;
  }

  /**
   * Hedef kendi yönettiği clinic'lerden birinde mi? (Manage için)
   */
  isTargetInMyClinicForManage(target?: HasClinic): boolean {
    if (!target?.clinicId) return false;
    return !!this.actor.managedClinics?.some(
      (clinic) => clinic.id === target.clinicId
    );
  }

  /**
   * Hedef kendi çalıştığı clinic'te mi? (Read için)
   */
  isTargetInMyClinicForRead(target: HasClinic | null | undefined): boolean {
    if (!target?.clinicId || !this.actor.clinicId) return false;
    return this.actor.clinicId === target.clinicId;
  }
  /**
   * Privileged user mu? (Priority >= 80)
   */
  isPrivilegedUser(): boolean {
    return this.actorPriority >= 80;
  }
  /**
   * Aktör, hedeften KESİN OLARAK ÜST mü?
   */
  hasHigherPriorityThan(
    target: User | HasRole | HasPriority | number
  ): boolean {
    return this.actorPriority > this.getTargetPriority(target);
  }

  /**
   * Aktör ve hedef AYNI seviyede mi?
   */
  hasEqualPriorityWith(target: User | HasRole | HasPriority | number): boolean {
    return this.actorPriority === this.getTargetPriority(target);
  }

  /**
   * Aktör, hedeften DÜŞÜK mü?
   */
  hasLowerPriorityThan(target: User | HasRole | HasPriority | number): boolean {
    return this.actorPriority < this.getTargetPriority(target);
  }
  /**
   * Partial user yönetimi (Create sırasında clinic kontrolü)
   */
  canManagePartialUser(clinicId: string): boolean {
    return this.isTargetInMyClinicForManage({ clinicId });
  }

  //? ==========================================
  //? PRIORITY CHECKS (Cached)
  //? ==========================================

  /**
   * Kullanıcıyı tamamen yönetebilir mi? (Update/Delete)*
   */
  canManageUser(targetUser: User): boolean {
    if (!this.isTargetInMyClinicForManage({ clinicId: targetUser.clinicId })) {
      return false;
    }
    return this.hasHigherPriorityThan(targetUser);
  }

  /**
   * Kullanıcıyı silebilir mi?
   */
  canDeleteUser(targetUser: User): boolean {
    if (this.isSelf(targetUser.id)) {
      return false;
    }
    return this.canManageUser(targetUser);
  }

  //? ==========================================
  //? BUSINESS LOGIC (Main Policy Methods)
  //? ==========================================

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
   * for debug
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

  private getTargetPriority(
    target: User | HasRole | HasPriority | number
  ): number {
    if (typeof target === 'number') {
      return target;
    }

    if ('role' in target && target.role) {
      return target.role.priority;
    }

    if ('priority' in target) {
      return target.priority;
    }

    return 0;
  }
}
