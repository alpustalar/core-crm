import { IQuery } from '@nestjs/cqrs';
import { GetAdAttributedLeadsResponse } from './get-ad-attributed-leads.response';

/**
 * Reklam kampanyasına atfedilen, dönemde oluşmuş ve hastaya dönüşmüş lead'ler.
 * Meta Ads ROI raporu (kampanya → hasta → gelir) için cross-module kullanılır.
 */
export class GetAdAttributedLeadsQuery implements IQuery {
  readonly __responseType!: GetAdAttributedLeadsResponse;
  constructor(
    public readonly payload: { clinicId: string; from: Date; to: Date }
  ) {}
}
