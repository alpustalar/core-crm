import { PosDevice } from './pos-device.entity';
import {
  PosDeviceClinicMismatchException,
  PosDeviceInactiveException,
} from '@modules/finance/pos/physical/domain/exceptions/pos.exceptions';

/**
 * Cihaz ↔ klinik bağı bir **kiracı değişmezidir**: yetki `clinicId` üzerinden
 * veriliyor, cihaz ise ayrı bir alandan (`posDeviceId`) geliyor. İkisi
 * bağlanmazsa kart başka kliniğin terminalinde — yani onun üye işyeri hesabında
 * — çekilir, kayıt çağıranın defterine düşer.
 */
describe('PosDevice — kiracı kapsamı ve durum guardları', () => {
  const DEVICE_ID = '11111111-1111-4111-8111-111111111111';
  const CLINIC_ID = '22222222-2222-4222-8222-222222222222';
  const OTHER_CLINIC = '33333333-3333-4333-8333-333333333333';

  const makeDevice = () =>
    PosDevice.create({
      id: DEVICE_ID,
      clinicId: CLINIC_ID,
      label: 'Kasa 1',
      provider: 'PAX',
      terminalId: 'T1',
      merchantId: 'M1',
      host: '127.0.0.1',
      port: 10009,
    });

  it('kendi kliniği geçilirse sorun çıkarmaz', () => {
    expect(() => makeDevice().assertBelongsToClinic(CLINIC_ID)).not.toThrow();
  });

  it('başka klinik geçilirse reddeder', () => {
    expect(() => makeDevice().assertBelongsToClinic(OTHER_CLINIC)).toThrow(
      PosDeviceClinicMismatchException
    );
  });

  it('reddetme meta ile hangi kliniklerin çeliştiğini bildirir', () => {
    const device = makeDevice();
    try {
      device.assertBelongsToClinic(OTHER_CLINIC);
      throw new Error('beklenen hata fırlatılmadı');
    } catch (caught) {
      const error = caught as PosDeviceClinicMismatchException;
      expect(error.meta).toEqual({
        deviceClinicId: CLINIC_ID,
        requestedClinicId: OTHER_CLINIC,
      });
    }
  });

  it('pasif cihaz tipli domain hatası verir (çıplak Error → 500 değil)', () => {
    const device = makeDevice();
    device.deactivate();

    expect(() => device.validate.status.isActive.orThrow()).toThrow(
      PosDeviceInactiveException
    );
  });
});
