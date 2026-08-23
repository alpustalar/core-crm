import { CriticalFailureListener } from './critical-failure.listener';
import { CriticalFailureEvent } from '@common/observability/critical-failure.event';

describe('CriticalFailureListener', () => {
  const event = new CriticalFailureEvent({
    operation: 'finance.pos.accounting-bridge',
    severity: 'CRITICAL',
    summary: 'POS tahsilatı alındı ancak muhasebe köprüsü çalışmadı.',
    errorMessage: 'timeout',
    context: { posTransactionId: 'tx-1' },
    clinicId: 'clinic-1',
    dedupeKey: 'pos-bridge-failed:tx-1',
  });

  it('uyarıyı porta iletir', async () => {
    const alert = jest.fn().mockResolvedValue(undefined);
    const listener = new CriticalFailureListener({ alert });

    await listener.handle(event);

    expect(alert).toHaveBeenCalledWith(
      expect.objectContaining({
        operation: 'finance.pos.accounting-bridge',
        severity: 'CRITICAL',
        dedupeKey: 'pos-bridge-failed:tx-1',
      })
    );
  });

  it('uyarı kanalı erişilemezse hatayı yutar', async () => {
    // Kanal hatası, kanalın haber vermeye çalıştığı hatayı büyütmemeli.
    const alert = jest.fn().mockRejectedValue(new Error('slack 503'));
    const listener = new CriticalFailureListener({ alert });

    await expect(listener.handle(event)).resolves.toBeUndefined();
  });
});
