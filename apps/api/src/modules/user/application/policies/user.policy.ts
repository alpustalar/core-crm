import { User } from '@prisma/client';
import { ActorContext } from '@common/interfaces';
import { UserResponseGroups } from '@modules/user/domain/constants';
import { IUser } from '@modules/user/domain/repositories/user.repository';
import { ClinicPolicy } from '@modules/clinic/application/policies';

interface HasPriority {
  priority: number;
  role?: {
    priority: number;
  };
}

const { ADMIN, INTERNAL, FINANCIAL, DATA_OWNER, MANAGEMENT } =
  UserResponseGroups;
export class UserPolicy extends ClinicPolicy {
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
  isTargetInActorsManagedClinic(
    targetUserClinicId: string | null | undefined
  ): boolean {
    if (!targetUserClinicId) return false;
    return this.actorCanManageTargetClinic(targetUserClinicId);
  }

  /**
   * Hedef kendi çalıştığı clinic'te mi? (Read için)
   */
  isTargetInActorsSameClinic(
    targetUserClinicId: string | null | undefined
  ): boolean {
    if (!targetUserClinicId || !this.actor.clinicId) return false;
    return this.actorCanAccessTargetClinic(targetUserClinicId);
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
  actorHasHigherPriorityThanTarget(
    targetUser: IUser | HasPriority | number
  ): boolean {
    return this.actorPriority > this.getTargetPriority(targetUser);
  }

  /**
   * Aktör ve hedef AYNI seviyede mi?
   */
  actorHasEqualPriorityWithTarget(
    target: IUser | HasPriority | number
  ): boolean {
    return this.actorPriority === this.getTargetPriority(target);
  }

  /**
   * Aktör, hedeften DÜŞÜK mü?
   */
  actorHasLowerPriorityThanTarget(
    target: IUser | HasPriority | number
  ): boolean {
    return this.actorPriority < this.getTargetPriority(target);
  }
  //? ==========================================
  //? PRIORITY CHECKS (Cached)
  //? ==========================================

  /**
   * Kullanıcıyı tamamen yönetebilir mi? (Update/Delete)*
   */
  actorCanManageTargetUser(targetUser: IUser): boolean {
    if (!this.isTargetInActorsManagedClinic(targetUser.clinicId)) {
      return false;
    }
    return this.actorHasHigherPriorityThanTarget(targetUser);
  }

  /**
   * Kullanıcıyı silebilir mi?
   */
  actorCanDeleteTargetUser(targetUser: IUser): boolean {
    if (this.isSelf(targetUser.id)) {
      return false;
    }
    return this.actorCanManageTargetUser(targetUser);
  }

  //? ==========================================
  //? BUSINESS LOGIC (Main Policy Methods)
  //? ==========================================

  /**
   * Kullanıcının rolünü değiştirebilir mi?
   *
   * NOT: Hem targetUser.role hem newRole.priority gerekli
   */
  actorCanChangeTargetUserRole(
    targetUser: IUser,
    newRolePriority: number
  ): boolean {
    if (!this.actorCanManageTargetUser(targetUser)) {
      return false;
    }

    return this.actorHasHigherPriorityThanTarget({ priority: newRolePriority });
  }

  /**
   * kullanıcı geri dönüş grupları
   */

  getUserSerializeOptions(
    targetUserId: string,
    targetUserClinicId: string | null | undefined
  ) {
    const isSameClinic = this.isTargetInActorsSameClinic(targetUserClinicId);
    const isManager = this.isTargetInActorsManagedClinic(targetUserClinicId);
    const isSelf = this.isSelf(targetUserId);
    const isAdmin = this.isSystemAdmin();

    const groups = [
      isSelf && DATA_OWNER,
      isManager && MANAGEMENT,
      isManager && FINANCIAL,
      isSameClinic && INTERNAL,
      isAdmin && ADMIN,
    ].filter((group) => typeof group === 'string');

    return {
      isGroupActive: isSameClinic || isSelf || isManager || isAdmin,
      groups,
    };
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

  private getTargetPriority(target: User | HasPriority | number): number {
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
