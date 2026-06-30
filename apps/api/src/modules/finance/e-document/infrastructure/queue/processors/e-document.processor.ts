import { Job } from 'bullmq';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { E_DOCUMENT_JOBS, QUEUES } from '@common/constants';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { ExecutionContextFactory } from '@src/domain/common/execution/execution-context.factory';
import { PartyRoleSchema } from '@shared';
import {
  E_INVOICE_PORT,
  EInvoicePort,
} from '@modules/finance/e-document/domain/ports/e-invoice.port';
import { resolveDocumentType } from '@modules/finance/e-document/domain/services/document-type-resolver';

import { GetInvoiceByIdQuery } from '@modules/finance/invoice/application/queries/get-invoice-by-id/get-invoice-by-id.query';
import { MarkInvoiceEDocumentResultCommand } from '@modules/finance/invoice/application/commands/mark-invoice-edocument-result/mark-invoice-edocument-result.command';
import { GetClinicGovernmentSpecsQuery } from '@modules/organization/clinic-governance/application/queries/get-clinic-government-specs/get-clinic-government-specs.query';
import { EnsurePartyForPatientCommand } from '@modules/finance/party/application/commands/ensure-party-for-patient/ensure-party-for-patient.command';
import { GetPartyByIdQuery } from '@modules/finance/party/application/queries/get-party-by-id/get-party-by-id.query';
import { EDocumentRequest } from '@modules/finance/e-document/domain/e-document.contracts';

interface SendJobData {
  invoiceId: string;
}

/**
 * e-Belge gönderim işleyicisi (doc 07 §5). Faturayı, satıcı (klinik) ve alıcı (hasta
 * carisi) kimliklerini toplar, belge türünü çözer, portu çağırır ve sonucu faturaya
 * işler. Entegratör kapalıyken NoopEInvoiceAdapter devrede → belge INTERNAL kalır,
 * akış hata fırlatmadan tamamlanır.
 */
@Processor(QUEUES.E_DOCUMENT)
export class EDocumentProcessor extends WorkerHost {
  private readonly logger = new Logger(EDocumentProcessor.name);
  private readonly internalCtx = ExecutionContextFactory.createInternal();

  constructor(
    @Inject(E_INVOICE_PORT) private readonly eInvoicePort: EInvoicePort,
    private readonly commandBus: TSCommandBus,
    private readonly queryBus: TSQueryBus
  ) {
    super();
  }

  async process(job: Job<SendJobData>): Promise<void> {
    switch (job.name) {
      case E_DOCUMENT_JOBS.SEND:
        await this.handleSend(job.data.invoiceId);
        break;
      default:
        this.logger.warn(`Bilinmeyen e-belge job'u: ${job.name}`);
    }
  }

  private async handleSend(invoiceId: string): Promise<void> {
    const { data: invoice } = await this.queryBus.execute(
      new GetInvoiceByIdQuery(invoiceId, this.internalCtx)
    );
    if (!invoice) {
      this.logger.warn(`Fatura bulunamadı, e-belge atlanıyor: ${invoiceId}`);
      return;
    }

    // Satıcı: kliniğin devlet/regülasyon kimliği (VKN + yasal tip).
    const { data: specs } = await this.queryBus.execute(
      new GetClinicGovernmentSpecsQuery(invoice.clinicId, this.internalCtx)
    );
    const legalType = specs?.legalType ?? 'KURUM';

    // Alıcı: hastanın finans carisi (idempotent garanti → party detayı).
    const { partyId } = await this.commandBus.execute(
      new EnsurePartyForPatientCommand(
        invoice.patientId,
        invoice.clinicId,
        PartyRoleSchema.enum.CUSTOMER,
        this.internalCtx
      )
    );
    const { data: buyer } = await this.queryBus.execute(
      new GetPartyByIdQuery(partyId, this.internalCtx)
    );

    const documentType = resolveDocumentType({
      legalType,
      buyerIsEInvoiceUser: buyer?.isEInvoiceUser ?? false,
    });

    const request: EDocumentRequest = {
      type: documentType,
      invoiceId: invoice.id,
      issueDate: invoice.issuedAt ?? new Date(),
      seller: {
        // TODO(gerçek-adapter): kliniğin yasal unvanını çöz; Noop kullanmıyor.
        taxId: specs?.companyTaxNumber ?? null,
        name: '',
      },
      buyer: {
        taxId: buyer?.taxNumber ?? buyer?.nationalId ?? null,
        name: buyer?.name ?? '',
        isEInvoiceUser: buyer?.isEInvoiceUser ?? false,
        alias: buyer?.eInvoiceMailbox ?? null,
      },
      lines: [
        {
          name: 'Hizmet bedeli',
          quantity: 1,
          unitPrice: invoice.netTotal,
          vatRate: Number(invoice.vatRate),
          vatAmount: invoice.vatTotal,
        },
      ],
      totals: {
        net: invoice.netTotal,
        vat: invoice.vatTotal,
        payable: invoice.grandTotal,
      },
      currency: invoice.currency,
    };

    const result = await this.eInvoicePort.issue(request);

    await this.commandBus.execute(
      new MarkInvoiceEDocumentResultCommand(
        {
          invoiceId: invoice.id,
          documentType: result.documentType,
          uuid: result.uuid,
          status: result.status,
          invoiceNumber: result.invoiceNumber,
        },
        this.internalCtx
      )
    );

    this.logger.log(
      `e-Belge işlendi: invoiceId=${invoice.id}, tür=${result.documentType}, durum=${result.status}`
    );
  }
}
