import { ZodValidationPipe } from 'nestjs-zod';
import { ArgumentMetadata } from '@nestjs/common';
import { UserCommandController } from './users.command.controller';
import { SendVerificationEmailCommand } from '@modules/identity/user/application/commands/send-verification-email';
import { CheckEmailDto } from '@shared';

/**
 * Bu uç sessizce bozulmuştu: `@Body('email')` gövdenin `email` ALANINI (string)
 * döndürürken parametre tipi `CheckEmailDto` (object şeması) kalmıştı. Global
 * ZodValidationPipe string'i object şemasına doğrulamaya çalıştığı için istek
 * handler'a hiç ulaşmıyordu. Testler dekoratörü çalıştırmadığından tsc de jest
 * de bunu göremezdi — o yüzden sözleşme burada açıkça sabitleniyor.
 */
describe('UserCommandController — e-posta doğrulama ucu', () => {
  const meta: ArgumentMetadata = { type: 'body', metatype: CheckEmailDto };

  describe('gövde sözleşmesi', () => {
    const pipe = new ZodValidationPipe();

    it('tam gövde ({ email }) doğrulamadan geçer ve küçük harfe iner', () => {
      expect(pipe.transform({ email: 'Hasta@Klinik.COM' }, meta)).toEqual({
        email: 'hasta@klinik.com',
      });
    });

    // EmailSchema önce trim/lowercase yapıp sonucu doğrular. Ters sıra
    // (`z.email().trim()`) doğrulamayı ham değere uygular ve yapıştırılan
    // adresteki boşluk yüzünden isteği 400'e düşürürdü.
    it('kopyala-yapıştırdan gelen boşluk temizlenir', () => {
      expect(pipe.transform({ email: '  Hasta@Klinik.COM  ' }, meta)).toEqual({
        email: 'hasta@klinik.com',
      });
    });

    it('boşluk temizlendikten sonra da geçersizse reddedilir', () => {
      expect(() => pipe.transform({ email: '  hasta@  ' }, meta)).toThrow();
    });

    it('çıplak string reddedilir — `@Body(\'email\')` kullanılamayacağının kanıtı', () => {
      expect(() => pipe.transform('hasta@klinik.com', meta)).toThrow();
    });
  });

  it('gövdedeki e-posta command olarak bus\'a geçer', () => {
    const commandBus = { execute: jest.fn() };
    const controller = new UserCommandController(commandBus as never);

    controller.sendEmailVerificationLink({
      email: 'hasta@klinik.com',
    } as CheckEmailDto);

    expect(commandBus.execute).toHaveBeenCalledTimes(1);
    const command = commandBus.execute.mock
      .calls[0][0] as SendVerificationEmailCommand;
    expect(command).toBeInstanceOf(SendVerificationEmailCommand);
    expect(command.email).toBe('hasta@klinik.com');
  });
});
