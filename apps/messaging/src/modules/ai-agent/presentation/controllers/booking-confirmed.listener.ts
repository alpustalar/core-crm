import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { BookingConfirmedEventPayload, NATS_SUBJECTS } from '@src/transport';
import { SendBookingConfirmationCommand } from '@modules/ai-agent/application/commands/send-booking-confirmation/send-booking-confirmation.command';

/**
 * Core'un "rezervasyon onaylandı" olayını dinler ve müşteriye kanaldan bildirimi
 * messaging'in kendi komutuyla yürütür.
 *
 * Sınırın doğru tarafı burası: core ne mesajın nasıl yazılacağını (AI dili / 24s
 * penceresi / HSM şablonu) ne de hangi kanaldan gideceğini bilir; yalnız olguyu
 * duyurur. `@EventPattern` — yanıt beklenmez, core bildirimi beklemez.
 */
@Controller()
export class BookingConfirmedListener {
  private readonly logger = new Logger(BookingConfirmedListener.name);

  constructor(private readonly commandBus: TSCommandBus) {}

  @EventPattern(NATS_SUBJECTS.booking.confirmed)
  async handle(
    @Payload() payload: BookingConfirmedEventPayload
  ): Promise<void> {
    try {
      await this.commandBus.execute(
        new SendBookingConfirmationCommand({
          clinicId: payload.clinicId,
          conversationId: payload.conversationId,
          bookingType: payload.bookingType as 'HOTEL' | 'TRANSFER',
          reference: payload.referenceCode,
          summary: payload.summary,
        })
      );
    } catch (err) {
      // Bildirim başarısızlığı olayın yeniden işlenmesini tetiklememeli; rezervasyon
      // zaten tamamlandı, müşteriye ulaşamamak ayrı bir sorundur ve loglanır.
      this.logger.warn(
        `Rezervasyon onay mesajı gönderilemedi (conversation=${
          payload.conversationId
        }): ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }
}
