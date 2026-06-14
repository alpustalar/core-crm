export const CONTEXT_SERVICE = Symbol('IContextService');

export interface IContextService {
  /**
   * Sistem genelinde işletilen transaction veya request bağlamına
   * bir domain event ekler.
   */
  addEvent(eventInstance: object): void;

  /**
   * O anki akışın takibini sağlayan benzersiz korelasyon ID'sini döner.
   */
  getCorrelationId(): string;
}
