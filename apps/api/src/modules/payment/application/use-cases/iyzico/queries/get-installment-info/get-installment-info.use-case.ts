import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  IyzicoMapper,
  IyzicoSdkStatus,
} from '@src/infrastructure/persistence/payment/providers/iyzico';
import { IyzicoProvider } from '@src/infrastructure/persistence/payment/providers/iyzico/iyzico.provider';

export interface InstallmentOption {
  installmentNumber: number;
  totalPrice: number;
  installmentPrice: number;
  installmentRate: number;
}

export interface InstallmentInfoResult {
  binNumber: string;
  price: number;
  options: InstallmentOption[];
}

interface GetInstallmentInfoInput {
  binNumber: string;
  price: number;
}

@Injectable()
export class GetInstallmentInfoUseCase {
  private readonly logger = new Logger(GetInstallmentInfoUseCase.name);

  constructor(private readonly iyzicoProvider: IyzicoProvider) {}

  async execute({
    binNumber,
    price,
  }: GetInstallmentInfoInput): Promise<InstallmentInfoResult> {
    const sdkResult = await this.iyzicoProvider.getInstallmentInfo({
      locale: 'TR',
      conversationId: randomUUID(),
      price: price.toFixed(2),
      binNumber,
    });

    if (sdkResult.status.toLowerCase() !== IyzicoSdkStatus.SUCCESS) {
      this.logger.log(`Taksit bilgisi alınamadı: ${sdkResult.errorMessage}`, {
        binNumber,
      });
      throw new BadRequestException(
        `Taksit bilgisi alınamadı: ${sdkResult.errorMessage}`
      );
    }

    return IyzicoMapper.toInstallmentInfoResult(sdkResult);
  }
}
