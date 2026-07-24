import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { Decimal } from 'decimal.js';
import { IGetContext } from '@common/decorators';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { EnsurePartyCommand } from '@modules/finance/party/application/commands/ensure-party/ensure-party.command';
import { RecordFinancialEventCommand } from '@modules/finance/accounting/financial-events/application/commands/record-financial-event/record-financial-event.command';
import {
  IPurchaseInvoiceCommandRepository,
  PURCHASE_INVOICE_COMMAND_REPOSITORY,
} from '@modules/finance/purchase-invoice/domain/repositories/purchase-invoice.repository';
import { PurchaseInvoice } from '@modules/finance/purchase-invoice/domain/entities/purchase-invoice.entity';
import {
  FinancialEventTypeSchema,
  PartyOriginTypeSchema,
  PartyRoleSchema,
  PartyTypeSchema,
} from '@shared';
import { RecordPurchaseInvoiceCommand } from './record-purchase-invoice.command';
import { FINANCIAL_EVENT_SOURCE_MODULES } from '@modules/finance/shared/domain/constants/financial-event-source-modules.constant';
import { FinancialEventDedupeKeys } from '@modules/finance/shared/domain/constants/financial-event-dedupe-keys.constant';
import { ExecutionContextFactory } from '@src/domain/common/execution/execution-context.factory';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { PriceBreakdown } from '@modules/finance/shared/domain/value-objects/price-breakdown.vo';
import { UUID } from '@src/domain/value-objects/uuid.vo';

@CommandHandler(RecordPurchaseInvoiceCommand)
export class RecordPurchaseInvoiceHandler
  implements ICommandHandler<RecordPurchaseInvoiceCommand, string>
{
  private readonly logger = new Logger(RecordPurchaseInvoiceHandler.name);
  private internalCtx = ExecutionContextFactory.createInternal();

  constructor(
    @Inject(PURCHASE_INVOICE_COMMAND_REPOSITORY)
    private readonly purchaseInvoiceCommandRepo: IPurchaseInvoiceCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly txManager: TransactionManager,
    private readonly commandBus: TSCommandBus
  ) {}

  async execute(command: RecordPurchaseInvoiceCommand): Promise<string> {
    const { data, ctx } = command;

    this.policyFactory
      .clinic(ctx.actor, ctx.source)
      .evaluator.check((p) =>
        p.actorCanAccessClinicAndOrganization(
          data.clinicId,
          data.organizationId
        )
      )
      .orThrow();

    const generatedPurchaseInvoiceId = UUID.generate();

    const priceBreakdown = PriceBreakdown.create({
      currency: data.currency,
      netAmount: data.netTotal,
      vatAmount: data.vatTotal,
    }).orThrow();

    const invoice = PurchaseInvoice.create({
      id: generatedPurchaseInvoiceId.value,
      clinicId: data.clinicId,
      organizationId: data.organizationId,
      supplierId: data.supplierId,
      invoiceNumber: data.invoiceNumber ?? null,
      invoiceDate: data.invoiceDate,
      lineAccountCode: data.lineAccountCode,
      vatRate: data.vatRate,
      netTotal: priceBreakdown.netAmount.value,
      vatTotal: priceBreakdown.vatAmount.value,
      grandTotal: priceBreakdown.grandTotal.value,
      currency: priceBreakdown.grandTotal.currency,
    });

    // Belge kaydı + muhasebe köprüsü aynı outboxRun içinde; köprü hatası try/catch ile
    // yutulur (belge kaydı geri alınmaz, olay dedupeKey ile sonradan üretilebilir).
    await this.txManager.outboxRun(async () => {
      await this.purchaseInvoiceCommandRepo.create(invoice);
      await this.recordPurchaseInvoiceReceived({
        purchaseInvoiceId: generatedPurchaseInvoiceId.value,
        clinicId: data.clinicId,
        organizationId: data.organizationId,
        supplierId: data.supplierId,
        supplierName: data.supplierName,
        supplierTaxNumber: data.supplierTaxNumber,
        supplierTaxOffice: data.supplierTaxOffice,
        invoiceDate: data.invoiceDate,
        lineAccountCode: data.lineAccountCode,
        netTotal: priceBreakdown.netAmount.value,
        vatTotal: priceBreakdown.vatAmount.value,
        grandTotal: priceBreakdown.grandTotal.value,
        ctx: this.internalCtx,
      });
    });

    return generatedPurchaseInvoiceId.value;
  }

  /**
   * Alış faturasını muhasebe katmanına köprüler: tedarikçi carisini (320) garanti
   * eder ve PURCHASE_INVOICE_RECEIVED olayını yazar. Olay Outbox'a düşer; posting
   * listener'ı fişi (150/770 + 191 / 320) üretir. dedupeKey ile idempotenttir.
   */

  private async recordPurchaseInvoiceReceived(
    input: RecordPurchaseInvoiceReceivedInput
  ): Promise<void> {
    try {
      const partyId = await this.commandBus.execute(
        new EnsurePartyCommand(
          {
            clinicId: input.clinicId,
            organizationId: input.organizationId,
            originType: PartyOriginTypeSchema.enum.SUPPLIER,
            originId: input.supplierId,
            role: PartyRoleSchema.enum.SUPPLIER,
            type: PartyTypeSchema.enum.COMPANY,
            name: input.supplierName,
            taxNumber: input.supplierTaxNumber ?? null,
            taxOffice: input.supplierTaxOffice ?? null,
          },
          this.internalCtx
        )
      );

      await this.commandBus.execute(
        new RecordFinancialEventCommand(
          {
            clinicId: input.clinicId,
            type: FinancialEventTypeSchema.enum.PURCHASE_INVOICE_RECEIVED,
            occurredAt: input.invoiceDate,
            payload: {
              partyId,
              netTotal: input.netTotal.toFixed(2),
              vatTotal: input.vatTotal.toFixed(2),
              grandTotal: input.grandTotal.toFixed(2),
              lineAccountCode: input.lineAccountCode,
            },
            sourceModule: FINANCIAL_EVENT_SOURCE_MODULES.PURCHASE_INVOICE,
            sourceRefId: input.purchaseInvoiceId,
            dedupeKey: FinancialEventDedupeKeys.purchase_invoice(
              input.purchaseInvoiceId
            ),
          },
          this.internalCtx
        )
      );
    } catch (error) {
      this.logger.error(
        `Muhasebe köprüsü başarısız: purchaseInvoiceId=${input.purchaseInvoiceId}`,
        error
      );
    }
  }
}

interface RecordPurchaseInvoiceReceivedInput {
  purchaseInvoiceId: string;
  clinicId: string;
  organizationId: string;
  supplierId: string;
  supplierName: string;
  supplierTaxNumber?: string;
  supplierTaxOffice?: string;
  invoiceDate: Date;
  lineAccountCode: string;
  netTotal: Decimal;
  vatTotal: Decimal;
  grandTotal: Decimal;
  ctx: IGetContext;
}
