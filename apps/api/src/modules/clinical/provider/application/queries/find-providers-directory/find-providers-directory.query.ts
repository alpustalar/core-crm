import { IQuery } from '@nestjs/cqrs';
import { FindProvidersDirectoryQueryResponse } from './find-providers-directory.response';

/**
 * Bir kliniğin aktif provider'larını uzmanlık + unvan adlarıyla döndürür (read-model).
 * AI asistanı hastanın anlattığı duruma göre doğru uzmanı seçmek için kullanır.
 */
export class FindProvidersDirectoryQuery implements IQuery {
  readonly __responseType!: FindProvidersDirectoryQueryResponse;
  constructor(public readonly clinicId: string) {}
}
