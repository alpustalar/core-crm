import { ClinicHealthTourismConfig } from './clinic-health-tourism-config.entity';

describe('ClinicHealthTourismConfig (B0)', () => {
  const base = { clinicId: 'clinic-1', organizationId: 'org-1' };

  it('create varsayılanları: kapalı, allowlist boş, EUR, fee null', () => {
    const cfg = ClinicHealthTourismConfig.create(base);
    expect(cfg.isEnabled).toBe(false);
    expect(cfg.nearbyHotelCodes).toEqual([]);
    expect(cfg.defaultCurrency).toBe('EUR');
    expect(cfg.serviceFeePercent).toBeNull();
  });

  it('serviceFeePercent sayıdan Decimal’e çevrilir ve değeri korur', () => {
    const cfg = ClinicHealthTourismConfig.create({
      ...base,
      serviceFeePercent: 12.5,
    });
    expect(cfg.serviceFeePercent?.toNumber()).toBe(12.5);
  });

  describe('effectiveHotelScope — allowlist öncelikli hibrit', () => {
    it('allowlist doluysa yalnız onu kullanır (şehir yok sayılır)', () => {
      const cfg = ClinicHealthTourismConfig.create({
        ...base,
        destinationCode: 'IST-CITY',
        nearbyHotelCodes: ['H1', 'H2'],
      });
      expect(cfg.effectiveHotelScope).toEqual({
        hotelCodes: ['H1', 'H2'],
        destinationCode: null,
      });
    });

    it('allowlist boşsa şehir destinationCode’una düşer', () => {
      const cfg = ClinicHealthTourismConfig.create({
        ...base,
        destinationCode: 'IST-CITY',
      });
      expect(cfg.effectiveHotelScope).toEqual({
        hotelCodes: null,
        destinationCode: 'IST-CITY',
      });
    });
  });

  it('updateSettings yalnız sağlanan alanları değiştirir', () => {
    const cfg = ClinicHealthTourismConfig.create({
      ...base,
      airportIata: 'IST',
      defaultCurrency: 'USD',
    });
    cfg.updateSettings({ airportIata: 'SAW' });
    expect(cfg.airportIata).toBe('SAW');
    expect(cfg.defaultCurrency).toBe('USD'); // dokunulmadı
  });

  it('fee null’a çekilebilir (temizleme)', () => {
    const cfg = ClinicHealthTourismConfig.create({
      ...base,
      serviceFeePercent: 10,
    });
    cfg.updateSettings({ serviceFeePercent: null });
    expect(cfg.serviceFeePercent).toBeNull();
  });
});
