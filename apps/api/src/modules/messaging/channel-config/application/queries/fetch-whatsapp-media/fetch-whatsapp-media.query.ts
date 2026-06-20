import { IQuery } from '@nestjs/cqrs';
import { FetchWhatsappMediaResponse } from './fetch-whatsapp-media.response';

/**
 * Bir kliniğin credential'ı ile Meta'dan gelen medyayı anlık indirir (proxy önizleme).
 * Internal: conversation media akışından bus üzerinden çağrılır (saklamaz).
 */
export class FetchWhatsappMediaQuery implements IQuery {
  readonly __responseType!: FetchWhatsappMediaResponse;
  constructor(
    public readonly clinicId: string,
    public readonly mediaId: string
  ) {}
}
