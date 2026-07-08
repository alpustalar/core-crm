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
import { ClinicNotAssignedException } from '@src/domain/exceptions/clinic-not-assigned.exception';
import { OrganizationNotAssignedException } from '@src/domain/exceptions/organization-not-assigned.exception';

@CommandHandler(RecordPurchaseInvoiceCommand)
export class RecordPurchaseInvoiceHandler
  implements ICommandHandler<RecordPurchaseInvoiceCommand, string>
{
  private readonly logger = new Logger(RecordPurchaseInvoiceHandler.name);

  constructor(
    @Inject(PURCHASE_INVOICE_COMMAND_REPOSITORY)
    private readonly purchaseInvoiceCommandRepo: IPurchaseInvoiceCommandRepository,
    private readonly txManager: TransactionManager,
    private readonly commandBus: TSCommandBus
  ) {}

  async execute(command: RecordPurchaseInvoiceCommand): Promise<string> {
    const { dto, ctx } = command;
    const clinicId = ctx.actor.clinicId;
    const organizationId = ctx.actor.organizationId;
    if (!clinicId) throw new ClinicNotAssignedException();
    if (!organizationId) throw new OrganizationNotAssignedException();

    const generatedPurchaseInvoiceId = crypto.randomUUID();
    const netTotal = new Decimal(dto.netTotal);
    const vatTotal = new Decimal(dto.vatTotal);
    const grandTotal = netTotal.plus(vatTotal);

    const invoice = PurchaseInvoice.create({
      id: generatedPurchaseInvoiceId,
      clinicId,
      organizationId,
      supplierId: dto.supplierId,
      invoiceNumber: dto.invoiceNumber ?? null,
      invoiceDate: dto.invoiceDate,
      lineAccountCode: dto.lineAccountCode,
      vatRate: dto.vatRate,
      netTotal,
      vatTotal,
      grandTotal,
      currency: dto.currency,
    });

    // Belge kaydı + muhasebe köprüsü aynı outboxRun içinde; köprü hatası try/catch ile
    // yutulur (belge kaydı geri alınmaz, olay dedupeKey ile sonradan üretilebilir).
    await this.txManager.outboxRun(async () => {
      await this.purchaseInvoiceCommandRepo.create(invoice);
      await this.recordPurchaseInvoiceReceived({
        purchaseInvoiceId: generatedPurchaseInvoiceId,
        clinicId,
        organizationId,
        supplierId: dto.supplierId,
        supplierName: dto.supplierName,
        supplierTaxNumber: dto.supplierTaxNumber,
        supplierTaxOffice: dto.supplierTaxOffice,
        invoiceDate: dto.invoiceDate,
        lineAccountCode: dto.lineAccountCode,
        netTotal,
        vatTotal,
        grandTotal,
        ctx,
      });
    });

    return generatedPurchaseInvoiceId;
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
          input.ctx
        )
      );

      // TODO: burdaki source module dedupe key gibi alanları daha sistemik bi hale getiricez belki bi fonksiyon içinde constantlarla kullanılabilir

      await this.commandBus.execute(
        new RecordFinancialEventCommand(
          {
            organizationId: input.organizationId,
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
            sourceModule: 'purchase-invoice',
            sourceRefId: input.purchaseInvoiceId,
            dedupeKey: `purchase-invoice:${input.purchaseInvoiceId}`,
          },
          input.ctx
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
