/**
 * AI araç sözleşmeleri — messaging (tüketici) ile core domain modülleri (araç sahibi)
 * arasındaki NÖTR sınır. Hiçbir taraf diğerinden import etmez; ikisi de buradan alır.
 *
 * Faz 3'te messaging ayrı bir servise çıktığında bu klasör `packages/shared`'a taşınır
 * ve `IAiToolExecutor` implementasyonu in-process dispatcher yerine NATS istemcisi olur —
 * tüketici tarafında tek satır bile değişmez.
 */
export * from './ai-tool.contracts';
export * from './ai-sub-tool.contracts';
export * from './ai-tool.names';
