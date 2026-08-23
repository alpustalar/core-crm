import { CriticalFailurePublisher } from './critical-failure.publisher';
import { CriticalFailureEvent } from '@common/observability/critical-failure.event';

/**
 * Bu yayıncının tek sözleşmesi var: **asla fırlatmaz**. Çağrıldığı yerler
 * `catch` blokları — fırlatırsa, zaten başarısız olmuş bir akışı ikinci kez
 * düşürür ve asıl hatayı maskeler.
 */
describe('CriticalFailurePublisher', () => {
  const payload = {
    operation: 'finance.ledger.enqueue',
    severity: 'CRITICAL' as const,
    summary: 'Cari kayıt kuyruğa alınamadı.',
    errorMessage: 'connection refused',
    context: { installmentId: 'inst-1' },
    clinicId: 'clinic-1',
    dedupeKey: 'ledger-enqueue-failed:inst-1',
  };

  it('event adıyla ve payload alanlarını taşıyarak yayınlar', () => {
    const emit = jest.fn();
    const publisher = new CriticalFailurePublisher({ emit } as never);

    publisher.publish(payload);

    expect(emit).toHaveBeenCalledTimes(1);
    const [name, event] = emit.mock.calls[0] as [string, CriticalFailureEvent];
    expect(name).toBe(CriticalFailureEvent.NAME);
    expect(event).toBeInstanceOf(CriticalFailureEvent);
    expect(event.operation).toBe('finance.ledger.enqueue');
    expect(event.dedupeKey).toBe('ledger-enqueue-failed:inst-1');
  });

  it('event bus patlasa bile fırlatmaz', () => {
    const emit = jest.fn(() => {
      throw new Error('event bus down');
    });
    const publisher = new CriticalFailurePublisher({ emit } as never);

    expect(() => publisher.publish(payload)).not.toThrow();
  });

  it('uyarı girdisi occurredAt taşır (kanalda zaman damgası görünsün)', () => {
    const event = new CriticalFailureEvent(payload);
    const input = event.toAlertInput();

    expect(input.occurredAt).toBeInstanceOf(Date);
    expect(input.summary).toBe('Cari kayıt kuyruğa alınamadı.');
    expect(input.context).toEqual({ installmentId: 'inst-1' });
  });
});
