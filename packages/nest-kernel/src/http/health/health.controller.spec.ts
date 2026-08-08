import { ServiceUnavailableException } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthIndicator } from './health-indicator.interface';

const indicator = (
  name: string,
  result: boolean | Error
): HealthIndicator => ({
  name,
  isHealthy: jest.fn(() =>
    result instanceof Error ? Promise.reject(result) : Promise.resolve(result)
  ),
});

describe('HealthController', () => {
  describe('liveness', () => {
    it('bağımlılıklara bakmaz — veritabanı düştü diye konteyner yeniden başlatılmamalı', () => {
      const down = indicator('mongo', false);
      const controller = new HealthController([down]);

      expect(controller.live()).toEqual({ status: 'ok' });
      expect(down.isHealthy).not.toHaveBeenCalled();
    });
  });

  describe('readiness', () => {
    it('hepsi ayaktaysa raporu döner', async () => {
      const controller = new HealthController([
        indicator('mongo', true),
        indicator('redis', true),
      ]);

      await expect(controller.ready()).resolves.toEqual({
        status: 'ok',
        checks: { mongo: 'up', redis: 'up' },
      });
    });

    it('biri düşükse 503 fırlatır — örnek yük dengeleyiciden çekilsin', async () => {
      const controller = new HealthController([
        indicator('mongo', false),
        indicator('redis', true),
      ]);

      await expect(controller.ready()).rejects.toBeInstanceOf(
        ServiceUnavailableException
      );
    });

    it('503 gövdesi hangi bağımlılığın düştüğünü söyler', async () => {
      const controller = new HealthController([
        indicator('mongo', false),
        indicator('redis', true),
      ]);

      const error = await controller.ready().catch((e) => e);

      expect(error.getResponse()).toEqual({
        status: 'error',
        checks: { mongo: 'down', redis: 'up' },
      });
    });

    it('kontrolün kendisi patlarsa "down" sayılır — probe 500 vermez', async () => {
      const controller = new HealthController([
        indicator('mongo', new Error('bağlantı koptu')),
      ]);

      const error = await controller.ready().catch((e) => e);

      expect(error).toBeInstanceOf(ServiceUnavailableException);
      expect(error.getResponse()).toEqual({
        status: 'error',
        checks: { mongo: 'down' },
      });
    });

    it('indicator yoksa hazır sayılır', async () => {
      const controller = new HealthController([]);

      await expect(controller.ready()).resolves.toEqual({
        status: 'ok',
        checks: {},
      });
    });
  });
});
