import { HttpStatus } from '@nestjs/common';
import { ChannelNotConnectedException } from './channel-config.exceptions';

/**
 * `meta` bir **sözleşmedir** (`@shared/ChannelNotConnectedMeta`): frontend hangi
 * kanalın bağlanması gerektiğini buradan okuyup doğru ekrana yönlendiriyor.
 * Test edilmemiş meta, kimsenin bakmadığı bir sözleşmedir — alan adı sessizce
 * değiştiğinde derleyici de yakalamaz (index signature her anahtarı kabul eder).
 */
describe('ChannelNotConnectedException', () => {
  it('kanalı meta içinde makine-okunur taşır', () => {
    const error = new ChannelNotConnectedException('TELEGRAM', 'clinic-1');

    expect(error.meta).toEqual({ channel: 'TELEGRAM', clinicId: 'clinic-1' });
    expect(error.errorCode).toBe('MESSAGING.CHANNEL_NOT_CONNECTED');
    expect(error.httpStatus).toBe(HttpStatus.NOT_FOUND);
  });

  it('mesaj kanal adını insan-okunur yazar', () => {
    expect(new ChannelNotConnectedException('WHATSAPP', 'c').message).toBe(
      'WhatsApp kanalı bağlı değil.'
    );
    expect(new ChannelNotConnectedException('INSTAGRAM', 'c').message).toBe(
      'Instagram kanalı bağlı değil.'
    );
  });
});
