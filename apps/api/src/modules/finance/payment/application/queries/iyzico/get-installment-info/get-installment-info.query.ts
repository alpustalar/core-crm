import { IQuery } from '@nestjs/cqrs';
import { GetInstallmentInfoQueryResponse } from './get-installment-info.response';

interface GetInstallmentInfoDto {
  binNumber: string;
  price: number;
}
export class GetInstallmentInfoQuery implements IQuery {
  readonly __responseType!: GetInstallmentInfoQueryResponse;

  constructor(public readonly dto: GetInstallmentInfoDto) {}
}
