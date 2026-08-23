import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  CriticalFailureEvent,
  CriticalFailurePayload,
} from '@common/observability/critical-failure.event';

/**
 * Kritik hata yayıncısı.
 *
 * **`contextService.addEvent()` KULLANMAZ** — bilerek. Diğer publisher'lar event'i
 * ALS'deki transaction store'una biriktirir ve commit sonunda yayınlar; bu yayıncı
 * ise çoğunlukla `catch` bloklarından çağrılıyor: o noktada transaction ya geri
 * alınmıştır ya da hiç yoktur (kuyruk işçisi, zamanlanmış tarama). ALS'ye
 * eklenen event orada asla yayınlanmazdı — sessiz bir bug.
 *
 * Bu yüzden doğrudan `EventEmitter2` üzerinden yayınlanır ve **hiçbir koşulda
 * fırlatmaz**: uyarı gönderimi, uyarıya sebep olan akışı ikinci kez düşüremez.
 */
@Injectable()
export class CriticalFailurePublisher {
  private readonly logger = new Logger(CriticalFailurePublisher.name);

  constructor(private readonly eventEmitter: EventEmitter2) {}

  publish(payload: CriticalFailurePayload): void {
    try {
      this.eventEmitter.emit(
        CriticalFailureEvent.NAME,
        new CriticalFailureEvent(payload)
      );
    } catch (error) {
      this.logger.error(
        `Kritik hata uyarısı yayınlanamadı: ${payload.operation}`,
        error
      );
    }
  }
}
