import { MessageDirection, MessageStatus } from '@prisma/client';
import { Message } from './message.entity';
import { MessageStatusChangedEvent } from '../events/message-status-changed.event';

describe('Message entity (durum geçişleri + idempotency)', () => {
  describe('createInbound', () => {
    it('INBOUND + RECEIVED durumunda oluşturulur, event fırlatmaz', () => {
      const msg = Message.createInbound({
        conversationId: 'c-1',
        body: 'merhaba',
        externalId: 'wamid.1',
      });
      expect(msg.direction).toBe(MessageDirection.INBOUND);
      expect(msg.status).toBe(MessageStatus.RECEIVED);
      expect(msg.externalId).toBe('wamid.1');
      expect(msg.getDomainEvents()).toHaveLength(0);
    });
  });

  describe('createOutbound', () => {
    it('OUTBOUND + QUEUED durumunda oluşturulur', () => {
      const msg = Message.createOutbound({
        conversationId: 'c-1',
        body: 'yanıt',
        sentByUserId: 'user-1',
      });
      expect(msg.direction).toBe(MessageDirection.OUTBOUND);
      expect(msg.status).toBe(MessageStatus.QUEUED);
      expect(msg.sentByUserId).toBe('user-1');
    });
  });

  describe('ileri-yön teslim geçişleri', () => {
    const buildOutbound = () =>
      Message.createOutbound({ conversationId: 'c-1', body: 'x' });

    it('QUEUED→SENT→DELIVERED→READ ilerler ve her geçişte event fırlatır', () => {
      const msg = buildOutbound();

      msg.markSent('wamid.out');
      expect(msg.status).toBe(MessageStatus.SENT);
      expect(msg.externalId).toBe('wamid.out');

      msg.markDelivered();
      expect(msg.status).toBe(MessageStatus.DELIVERED);

      msg.markRead();
      expect(msg.status).toBe(MessageStatus.READ);

      const events = msg.getDomainEvents();
      expect(events).toHaveLength(3);
      expect(events.every((e) => e instanceof MessageStatusChangedEvent)).toBe(
        true
      );
    });

    it('geri/yan geçişler idempotenttir (READ iken DELIVERED yok sayılır, event yok)', () => {
      const msg = buildOutbound();
      msg.markSent('wamid.out');
      msg.markRead();
      msg.clearDomainEvents();

      msg.markDelivered(); // READ'in gerisinde — uygulanmaz
      expect(msg.status).toBe(MessageStatus.READ);
      expect(msg.getDomainEvents()).toHaveLength(0);
    });

    it('aynı duruma tekrar geçiş event üretmez', () => {
      const msg = buildOutbound();
      msg.markSent('wamid.out');
      msg.clearDomainEvents();

      msg.markSent('wamid.out'); // SENT zaten — no-op
      expect(msg.getDomainEvents()).toHaveLength(0);
    });
  });

  describe('markFailed', () => {
    it('QUEUED/SENT iken FAILED olur, errorReason set edilir, event fırlatır', () => {
      const msg = Message.createOutbound({ conversationId: 'c-1', body: 'x' });
      msg.markSent('wamid.out');
      msg.clearDomainEvents();

      msg.markFailed('numara geçersiz');
      expect(msg.status).toBe(MessageStatus.FAILED);
      expect(msg.errorReason).toBe('numara geçersiz');
      expect(msg.getDomainEvents()).toHaveLength(1);
    });

    it('DELIVERED/READ olmuş mesaj geriye FAILED olamaz (no-op)', () => {
      const msg = Message.createOutbound({ conversationId: 'c-1', body: 'x' });
      msg.markSent('wamid.out');
      msg.markDelivered();
      msg.clearDomainEvents();

      msg.markFailed('geç gelen hata');
      expect(msg.status).toBe(MessageStatus.DELIVERED);
      expect(msg.getDomainEvents()).toHaveLength(0);
    });
  });
});
