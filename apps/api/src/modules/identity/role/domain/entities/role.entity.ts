import { Capability, Role as IRole, RoleCapability } from '@prisma/client';
import { AggregateRoot } from '@common/domain/aggregate-root';

export type RoleWithCapabilities = IRole & {
  capabilities?: (RoleCapability & { capability: Capability })[];
};

export class Role extends AggregateRoot implements IRole {
  constructor(data: RoleWithCapabilities) {
    super();
    this._id = data.id;
    this._name = data.name;
    this._slug = data.slug;
    this._priority = data.priority;
    this._isSystemRole = data.isSystemRole;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
    this._capabilities = data.capabilities
      ? data?.capabilities?.map((rc) => rc.capability)
      : null;
  }

  private _id: string;

  get id(): string {
    return this._id;
  }

  private _name: string;

  get name(): string {
    return this._name;
  }

  private _slug: string;

  get slug(): string {
    return this._slug;
  }

  private _priority: number;

  get priority(): number {
    return this._priority;
  }

  private _isSystemRole: boolean;

  get isSystemRole(): boolean {
    return this._isSystemRole;
  }

  private _createdAt: Date;

  get createdAt(): Date {
    return this._createdAt;
  }

  private _updatedAt: Date;

  get updatedAt(): Date {
    return this._updatedAt;
  }

  private _capabilities: Capability[] | null;

  get capabilities(): readonly Capability[] | null {
    return this._capabilities;
  }

  hasCapability(module: string, action: string): boolean {
    if (this._capabilities) {
      return this._capabilities.some(
        (c) => c.module === module && c.action === action
      );
    }
    return false;
  }

  toPersistence(): IRole {
    return {
      id: this._id,
      name: this._name,
      slug: this._slug,
      priority: this._priority,
      isSystemRole: this._isSystemRole,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
