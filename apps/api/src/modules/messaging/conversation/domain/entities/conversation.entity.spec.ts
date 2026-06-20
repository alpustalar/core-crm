import { Conversation } from './conversation.entity';

describe('Conversation — okunmamış sayaç', () => {
  const start = () =>
    Conversation.start({
      clinicId: 'clinic-1',
      organizationId: 'org-1',
      contactPhone: '+905550001122',
    });

  it('yeni yazışmada unreadCount 0', () => {
    expect(start().unreadCount).toBe(0);
  });

  it('gelen mesaj unreadCount artırır', () => {
    const c = start();
    c.recordInboundMessage({ messageId: 'm-1', body: 'a' });
    c.recordInboundMessage({ messageId: 'm-2', body: 'b' });
    expect(c.unreadCount).toBe(2);
  });

  it('markAgentRead unreadCount sıfırlar + okuma anı set eder', () => {
    const c = start();
    c.recordInboundMessage({ messageId: 'm-1', body: 'a' });
    const at = new Date('2026-06-20T10:00:00.000Z');
    c.markAgentRead(at);
    expect(c.unreadCount).toBe(0);
    expect(c.agentReadAt).toEqual(at);
  });
});
