import {
  AdminRequest as IAdminRequest,
  AdminRequestStatus,
  AdminRequestType,
} from '@shared';
import { AggregateRoot } from '@common/domain/aggregate-root';
import { BadRequestException } from '@nestjs/common';
import { AdminRequestCreatedEvent } from '@modules/platform/admin-request/domain/events/admin-request-created.event';
import { AdminRequestReviewedEvent } from '@modules/platform/admin-request/domain/events/admin-request-reviewed.event';
import { CreateAdminRequestProps } from '@modules/platform/admin-request/domain/types/create-admin-request.props';
import { JsonValueType as JsonValue } from '@input-type-schemas/JsonValueSchema';

export class AdminRequest extends AggregateRoot implements IAdminRequest {
  constructor(data: IAdminRequest) {
    super();
    this._id = data.id;
    this._type = data.type;
    this._status = data.status;
    this._targetId = data.targetId;
    this._requestedBy = data.requestedBy;
    this._organizationId = data.organizationId;
    this._metadata = data.metadata;
    this._reviewedBy = data.reviewedBy;
    this._reviewedAt = data.reviewedAt;
    this._reviewNote = data.reviewNote;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
  }

  private _id: string;
  get id(): string {
    return this._id;
  }

  private _type: AdminRequestType;
  get type(): AdminRequestType {
    return this._type;
  }

  private _status: AdminRequestStatus;
  get status(): AdminRequestStatus {
    return this._status;
  }

  private _targetId: string;
  get targetId(): string {
    return this._targetId;
  }

  private _requestedBy: string;
  get requestedBy(): string {
    return this._requestedBy;
  }

  private _organizationId: string | null;
  get organizationId(): string | null {
    return this._organizationId;
  }

  private _metadata: JsonValue | null;
  get metadata(): JsonValue | null {
    return this._metadata;
  }

  private _reviewedBy: string | null;
  get reviewedBy(): string | null {
    return this._reviewedBy;
  }

  private _reviewedAt: Date | null;
  get reviewedAt(): Date | null {
    return this._reviewedAt;
  }

  private _reviewNote: string | null;
  get reviewNote(): string | null {
    return this._reviewNote;
  }

  private _createdAt: Date;
  get createdAt(): Date {
    return this._createdAt;
  }

  private _updatedAt: Date;
  get updatedAt(): Date {
    return this._updatedAt;
  }

  static create(props: CreateAdminRequestProps): AdminRequest {
    const entity = new AdminRequest({
      id: props.id,
      type: props.type,
      status: AdminRequestStatus.PENDING,
      targetId: props.targetId,
      requestedBy: props.requestedBy,
      organizationId: props.organizationId ?? null,
      metadata: (props.metadata as JsonValue) ?? null,
      reviewedBy: null,
      reviewedAt: null,
      reviewNote: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    entity.addDomainEvent(
      new AdminRequestCreatedEvent({
        requestId: entity.id,
        type: entity.type,
        targetId: entity.targetId,
        requestedBy: entity.requestedBy,
        organizationId: entity.organizationId ?? undefined,
      })
    );

    return entity;
  }

  public approve(reviewedBy: string, reviewNote?: string): void {
    if (this._status !== AdminRequestStatus.PENDING) {
      throw new BadRequestException(
        'Yalnızca bekleyen istekler onaylanabilir.'
      );
    }
    this._status = AdminRequestStatus.APPROVED;
    this._reviewedBy = reviewedBy;
    this._reviewedAt = new Date();
    this._reviewNote = reviewNote ?? null;

    this.addDomainEvent(
      new AdminRequestReviewedEvent({
        requestId: this._id,
        type: this._type,
        status: AdminRequestStatus.APPROVED,
        targetId: this._targetId,
        requestedBy: this._requestedBy,
        reviewedBy,
        organizationId: this._organizationId ?? undefined,
        reviewNote,
      })
    );
  }

  public reject(reviewedBy: string, reviewNote?: string): void {
    if (this._status !== AdminRequestStatus.PENDING) {
      throw new BadRequestException(
        'Yalnızca bekleyen istekler reddedilebilir.'
      );
    }
    this._status = AdminRequestStatus.REJECTED;
    this._reviewedBy = reviewedBy;
    this._reviewedAt = new Date();
    this._reviewNote = reviewNote ?? null;

    this.addDomainEvent(
      new AdminRequestReviewedEvent({
        requestId: this._id,
        type: this._type,
        status: AdminRequestStatus.REJECTED,
        targetId: this._targetId,
        requestedBy: this._requestedBy,
        reviewedBy,
        organizationId: this._organizationId ?? undefined,
        reviewNote,
      })
    );
  }

  public isPending(): boolean {
    return this._status === AdminRequestStatus.PENDING;
  }

  public toPersistence(): IAdminRequest {
    return {
      id: this._id,
      type: this._type,
      status: this._status,
      targetId: this._targetId,
      requestedBy: this._requestedBy,
      organizationId: this._organizationId,
      metadata: this._metadata,
      reviewedBy: this._reviewedBy,
      reviewedAt: this._reviewedAt,
      reviewNote: this._reviewNote,
      createdAt: this._createdAt,
      updatedAt: new Date(),
    };
  }
}
