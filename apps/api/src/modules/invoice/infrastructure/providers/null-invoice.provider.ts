import { Injectable, Logger } from '@nestjs/common';
import {
  IInvoiceProvider,
  IssueInvoiceInput,
  IssueInvoiceResult,
} from '@modules/invoice/domain/interfaces/invoice-provider.interface';

@Injectable()
export class NullInvoiceProvider implements IInvoiceProvider {
  private readonly logger = new Logger(NullInvoiceProvider.name);

  async issue(input: IssueInvoiceInput): Promise<IssueInvoiceResult> {
    this.logger.warn(
      `Fatura entegratörü henüz yapılandırılmadı. invoiceId=${input.invoiceId}`
    );
    throw new Error(
      'Fatura entegratörü yapılandırılmamış. Lütfen bir entegratör seçin.'
    );
  }
}

