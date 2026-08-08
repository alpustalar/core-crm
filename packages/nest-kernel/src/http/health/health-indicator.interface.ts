/**
 * Servisin hazır sayılması için ayakta olması gereken tek bir bağımlılık.
 *
 * Bir bağımlılığın buraya girip girmeyeceğinin ölçütü şudur: **o olmadan servis
 * işini yapamıyor mu?** Yapabiliyorsa (yalnız körelıyorsa) buraya konmaz —
 * yoksa orkestratör çalışan bir örneği trafikten çeker. Örnek: messaging, NATS
 * kapalıyken de webhook alıp mesajı kaydeder, o yüzden NATS readiness'a girmez.
 */
export interface HealthIndicator {
  /** Rapor gövdesinde görünen ad (ör. "mongo", "redis"). */
  readonly name: string;

  /** Bağımlılık kullanılabilir durumda mı. Hata fırlatmaz — `false` döner. */
  isHealthy(): Promise<boolean>;
}

export const HEALTH_INDICATORS = Symbol('HEALTH_INDICATORS');

/** `/health/ready` yanıt gövdesi. */
export interface HealthReport {
  status: 'ok' | 'error';
  checks: Record<string, 'up' | 'down'>;
}
