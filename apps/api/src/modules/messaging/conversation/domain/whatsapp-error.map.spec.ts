import { resolveWhatsappError } from './whatsapp-error.map';

describe('resolveWhatsappError', () => {
  it('bilinen kod → TR neden + retriable bilgisi', () => {
    const info = resolveWhatsappError(131047, 'Re-engagement message');
    expect(info.reason).toMatch(/24 saatlik/);
    expect(info.retriable).toBe(false);
  });

  it('rate-limit kodu retriable işaretlenir', () => {
    expect(resolveWhatsappError(130429).retriable).toBe(true);
  });

  it('bilinmeyen kod → ham başlık fallback', () => {
    const info = resolveWhatsappError(999999, 'Orijinal başlık');
    expect(info.reason).toBe('Orijinal başlık');
    expect(info.retriable).toBe(false);
  });

  it('kod ve başlık yoksa genel mesaj', () => {
    expect(resolveWhatsappError(null).reason).toMatch(/Bilinmeyen/);
  });
});
