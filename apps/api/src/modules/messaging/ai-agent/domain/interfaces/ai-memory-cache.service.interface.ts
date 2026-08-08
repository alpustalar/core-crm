import { AiChatMessage } from '@modules/messaging/ai-agent/domain/ports/ai-chat.port';

declare module 'ioredis' {
  interface Redis {
    /** Pencere ısıtılmışsa elemanları, ısıtılmamışsa (soğuk) nil döner. */
    readAiMemory(
      windowKey: string,
      markerKey: string
    ): Promise<string[] | null>;
    /** Yalnız ısıtılmış pencereye ekler; soğukken 0 döner (kısmi pencere üretmez). */
    appendAiMemory(
      windowKey: string,
      markerKey: string,
      item: string,
      windowSize: string,
      ttlSeconds: string
    ): Promise<number>;
  }
}

// ----------------------------------------------------------------------
// Payload Types
// ----------------------------------------------------------------------

export interface WarmAiMemoryPayload {
  conversationId: string;
  /** Kronolojik (eski → yeni) tam pencere. */
  history: AiChatMessage[];
}

export interface AppendAiMemoryPayload {
  conversationId: string;
  message: AiChatMessage;
}

// ----------------------------------------------------------------------
// Contract Interface
// ----------------------------------------------------------------------

export interface IAiMemoryCacheService {
  /** Pencerede tutulan azami sohbet turu sayısı. */
  readonly windowSize: number;

  /**
   * Cache'teki bağlam penceresini döner. `null` → pencere hiç ısıtılmamış ya da
   * süresi dolmuş; çağıran DB'den yükleyip `warm()` ile ısıtmalıdır. Boş dizi ise
   * pencere ısıtılmıştır ama içinde modele beslenecek metin yoktur.
   */
  read(conversationId: string): Promise<AiChatMessage[] | null>;

  /** Pencereyi DB'den gelen kronolojik listeyle baştan yazar (read-through ısıtma). */
  warm(payload: WarmAiMemoryPayload): Promise<void>;

  /**
   * Tek turu pencerenin sonuna ekler ve pencereyi `windowSize` sınırında tutar.
   * Pencere soğuksa hiçbir şey yapmaz — aksi halde tek elemanlık "sahte" bir geçmiş
   * oluşur ve model bağlamı kaybeder.
   */
  append(payload: AppendAiMemoryPayload): Promise<void>;

  /** Pencereyi düşürür (yazışma kapandı/devredildi ya da geçmiş geçersizleşti). */
  clear(conversationId: string): Promise<void>;
}

// ----------------------------------------------------------------------
// Injection Token
// ----------------------------------------------------------------------

export const AI_MEMORY_CACHE_SERVICE = Symbol('IAiMemoryCacheService');
