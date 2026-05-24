import { Injectable, Logger } from '@nestjs/common';
import {
  InitiatePosPaymentInput,
  InitiatePosPaymentResult,
  IPhysicalPosProvider,
  PosCallbackPayload,
  PosCallbackResult,
} from '@modules/pos/domain/interfaces/physical-pos-provider.interface';

@Injectable()
export class NullPhysicalPosProvider implements IPhysicalPosProvider {
  private readonly logger = new Logger(NullPhysicalPosProvider.name);

  async initiate(
    input: InitiatePosPaymentInput
  ): Promise<InitiatePosPaymentResult> {
    this.logger.warn(
      `Fiziksel POS entegrasyonu henüz yapılandırılmadı. posTransactionId=${input.posTransactionId}`
    );
    throw new Error(
      'Fiziksel POS entegrasyonu yapılandırılmamış. Lütfen bir banka/terminal entegrasyonu seçin.'
    );
  }

  async parseCallback(payload: PosCallbackPayload): Promise<PosCallbackResult> {
    this.logger.warn('Fiziksel POS callback handler henüz yapılandırılmadı.');
    throw new Error('Fiziksel POS callback handler yapılandırılmamış.');
  }
}
