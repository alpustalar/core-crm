import {
  PLATFORM_CAPABILITY_MODULES,
  isPlatformCapability,
  platformModulesWithoutLabel,
} from './platform-capabilities';
import { CAPABILITIES } from './capabilities';

/**
 * Bu liste bir güvenlik sınırıdır: klinik yöneticisinin personeline
 * devredebileceği yetkilerin dışında kalanları belirler. Sessizce kayması
 * (model yeniden adlandırma, yeni platform modülü) yetki sızıntısı demektir.
 */
describe('Platform yetki sınırı', () => {
  it('listedeki her modülün etiketi var — ad değişikliği listeyi etkisiz bırakmasın', () => {
    expect(platformModulesWithoutLabel).toEqual([]);
  });

  it('listedeki her modül gerçekten üretilmiş bir yetki modülüdür', () => {
    const generated = new Set(
      Object.values(CAPABILITIES).flatMap((modelCaps) =>
        Object.values(modelCaps).map((cap) => cap.module.toLowerCase())
      )
    );

    for (const module of PLATFORM_CAPABILITY_MODULES) {
      expect(generated.has(module)).toBe(true);
    }
  });

  describe('platform kapsamı', () => {
    it.each([
      'subscription:read',
      'plan:update',
      'module:create',
      'adminrequest:delete',
      'role:update',
      'rolecapability:create',
      'capability:read',
      'usercapability:create',
    ])('%s devredilemez', (capability) => {
      expect(isPlatformCapability(capability)).toBe(true);
    });
  });

  describe('kiracı kapsamı — devredilebilir', () => {
    it.each([
      'patient:read',
      'appointment:create',
      'payment:create',
      'treatmentcharge:update',
      'invoice:read',
      'journalentry:create',
      'finance:read',
      // Kiracıya ait oldukları için BİLEREK platform sayılmazlar:
      'auditlog:read',
      'staffnotification:update',
    ])('%s devredilebilir', (capability) => {
      expect(isPlatformCapability(capability)).toBe(false);
    });
  });

  describe('biçimi bozuk girdi', () => {
    // Fail-closed: tanınmayan bir dize yanlışlıkla dağıtılabilir olmaktansa
    // reddedilsin.
    it.each(['', 'patient', 'patient:', ':read', 'sadece-metin'])(
      '%p platform sayılır (fail-closed)',
      (capability) => {
        expect(isPlatformCapability(capability)).toBe(true);
      }
    );

    it('modül adı büyük harfle gelse de yakalanır', () => {
      expect(isPlatformCapability('Subscription:read')).toBe(true);
    });
  });
});
