import { BaseEvent } from '@common/interfaces';
import { OPS_EVENTS } from '@src/domain/constants/events/ops.constant';
import type {
  OpsAlertSeverity,
  OpsAlertInput,
} from '@common/observability/ops-alert.port';

export interface CriticalFailurePayload {
  readonly operation: string;
  readonly severity: OpsAlertSeverity;
  readonly summary: string;
  readonly errorMessage: string | null;
  readonly context: Record<string, string | number | null>;
  readonly clinicId: string | null;
  readonly dedupeKey: string | null;
}

/**
 * Yutulmuş bir kritik hata.
 *
 * Denetim log'undan (`IAuditLog`) ayrıdır: audit "kim ne yaptı"yı saklar, bu event
 * "sistem bir şeyi yapamadı, birinin bakması lazım" der. Bu yüzden `BaseEvent`'in
 * `log` alanını kullanmaz — aktör olmayabilir (kuyruk işçisi, zamanlanmış tarama).
 */
export class CriticalFailureEvent extends BaseEvent {
  static readonly NAME = OPS_EVENTS.CRITICAL_FAILURE;

  public readonly operation: string;
  public readonly severity: OpsAlertSeverity;
  public readonly summary: string;
  public readonly errorMessage: string | null;
  public readonly context: Record<string, string | number | null>;
  public readonly clinicId: string | null;
  public readonly dedupeKey: string | null;

  constructor(payload: CriticalFailurePayload) {
    super();
    this.operation = payload.operation;
    this.severity = payload.severity;
    this.summary = payload.summary;
    this.errorMessage = payload.errorMessage;
    this.context = payload.context;
    this.clinicId = payload.clinicId;
    this.dedupeKey = payload.dedupeKey;
  }

  public toAlertInput(): OpsAlertInput {
    return {
      operation: this.operation,
      severity: this.severity,
      summary: this.summary,
      errorMessage: this.errorMessage,
      context: this.context,
      clinicId: this.clinicId,
      dedupeKey: this.dedupeKey,
      occurredAt: this.metadata.occurredAt,
    };
  }
}
