import { Capability, Role as IRole, RoleCapability } from '@prisma/client';
import { AggregateRoot } from '@common/domain/aggregate-root';

export type RoleWithCapabilities = IRole & {
  capabilities: (RoleCapability & { capability: Capability })[];
};

export class Role extends AggregateRoot implements IRole {
  private _id: string;
  private _name: string;
  private _slug: string;
  private _priority: number;
  private _isSystemRole: boolean;
  private _createdAt: Date;
  private _updatedAt: Date;
  private _capabilities: Capability[];

  constructor(data: RoleWithCapabilities) {
    super();
    this._id = data.id;
    this._name = data.name;
    this._slug = data.slug;
    this._priority = data.priority;
    this._isSystemRole = data.isSystemRole;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
    this._capabilities = data.capabilities.map((rc) => rc.capability);
  }

  get id(): string { return this._id; }
  get name(): string { return this._name; }
  get slug(): string { return this._slug; }
  get priority(): number { return this._priority; }
  get isSystemRole(): boolean { return this._isSystemRole; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }
  get capabilities(): readonly Capability[] { return this._capabilities; }

  hasCapability(module: string, action: string): boolean {
    return this._capabilities.some(
      (c) => c.module === module && c.action === action
    );
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
