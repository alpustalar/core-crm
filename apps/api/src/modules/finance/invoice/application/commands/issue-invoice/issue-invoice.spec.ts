import { IssueInvoiceHandler } from './issue-invoice.handler';
import { IssueInvoiceCommand } from './issue-invoice.command';
import { Money } from '@src/domain/value-objects/money.vo';
import { InvoiceTriggers } from '@modules/finance/invoice/domain/constants/invoice-triggers';
import { LogAction, LogType } from '@src/domain/constants/log-action.constant';
import { InvoiceStatusSchema } from '@input-type-schemas/InvoiceStatusSchema';
import { GetClinicOrganizationIdQuery } from '@modules/organization/clinic/application/queries/get-clinic-organization-id/get-clinic-organization-id.query';
import { GetTaxRateQuery } from '@modules/finance/accounting/tax-parameters/application/queries/get-tax-rate/get-tax-rate.query';
import { EnsurePartyForPatientCommand } from '@modules/finance/party/application/commands/ensure-party-for-patient/ensure-party-for-patient.command';
import { RecordFinancialEventCommand } from '@modules/finance/accounting/financial-events/application/commands/record-financial-event/record-financial-event.command';
import { QueueEDocumentCommand } from '@modules/finance/e-document/application/commands/queue-e-document/queue-e-document.command';

describe('IssueInvoiceHandler', () => {
  const input = {
    clinicId: 'clinic-1',
    patientId: 'patient-1',
    appointmentId: 'appt-1',
    paymentId: null,
    totalAmount: Money.fromTrusted(1000, 'TRY'),
    trigger: InvoiceTriggers.APPOINTMENT,
    action: LogAction.INVOICE_ISSUED,
    type: LogType.INFO,
  };

  const make = (existingInvoice: unknown = null) => {
    const invoiceCommandRepo = {
      create: jest.fn().mockResolvedValue(undefined),
      update: jest.fn(),
    };
    const invoiceQueryRepo = {
      findById: jest.fn(),
      findByAppointmentId: jest.fn().mockResolvedValue(existingInvoice),
      findByPaymentId: jest.fn().mockResolvedValue(existingInvoice),
      findMany: jest.fn(),
    };
    const txManager = {
      outboxRun: jest.fn((cb: () => Promise<unknown>) => cb()),
    };
    const commandBus = {
      execute: jest.fn((cmd: unknown) => {
        if (cmd instanceof EnsurePartyForPatientCommand) {
          return Promise.resolve({
            partyId: 'party-1',
            organizationId: 'org-1',
          });
        }
        return Promise.resolve(undefined);
      }),
    };
    const queryBus = {
      execute: jest.fn((query: unknown) => {
        if (query instanceof GetClinicOrganizationIdQuery) {
          return Promise.resolve({ data: 'org-1' });
        }
        if (query instanceof GetTaxRateQuery) {
          return Promise.resolve({ data: { rate: 10 } });
        }
        return Promise.resolve({ data: null });
      }),
    };

    const handler = new IssueInvoiceHandler(
      invoiceCommandRepo as never,
      invoiceQueryRepo as never,
      txManager as never,
      commandBus as never,
      queryBus as never
    );

    return {
      handler,
      invoiceCommandRepo,
      invoiceQueryRepo,
      txManager,
      commandBus,
      queryBus,
    };
  };

  it('mevcut fatura yoksa yeni fatura oluşturur, ekonomik olayı kaydeder ve e-belgeyi kuyruğa alır', async () => {
    const { handler, invoiceCommandRepo, txManager, commandBus, queryBus } =
      make(null);

    const result = await handler.execute(new IssueInvoiceCommand(input));

    expect(txManager.outboxRun).toHaveBeenCalledTimes(1);
    expect(invoiceCommandRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        clinicId: 'clinic-1',
        patientId: 'patient-1',
        appointmentId: 'appt-1',
        paymentId: null,
        organizationId: 'org-1',
        amount: 1000,
        vatRate: 10,
        status: InvoiceStatusSchema.enum.PENDING,
      })
    );

    const recordFinancialEventCall = (
      commandBus.execute as jest.Mock
    ).mock.calls.find(([c]) => c instanceof RecordFinancialEventCommand);
    expect(recordFinancialEventCall).toBeDefined();

    const queueEDocumentCall = (
      commandBus.execute as jest.Mock
    ).mock.calls.find(([c]) => c instanceof QueueEDocumentCommand);
    expect(queueEDocumentCall).toBeDefined();

    expect(queryBus.execute).toHaveBeenCalledWith(
      expect.any(GetClinicOrganizationIdQuery)
    );

    expect(result).toEqual({
      invoiceId: expect.any(String),
      invoiceNumber: null,
      status: InvoiceStatusSchema.enum.PENDING,
    });
  });

  it('randevu için zaten fatura varsa yeni kayıt oluşturmadan mevcut faturayı döner', async () => {
    const existingInvoice = {
      id: { value: 'inv-existing' },
      invoiceNumber: null,
      status: InvoiceStatusSchema.enum.ISSUED,
    };
    const { handler, invoiceCommandRepo, txManager, commandBus } =
      make(existingInvoice);

    const result = await handler.execute(new IssueInvoiceCommand(input));

    expect(invoiceCommandRepo.create).not.toHaveBeenCalled();
    expect(txManager.outboxRun).not.toHaveBeenCalled();
    expect(commandBus.execute).not.toHaveBeenCalled();
    expect(result).toEqual({
      invoiceId: 'inv-existing',
      invoiceNumber: null,
      status: InvoiceStatusSchema.enum.ISSUED,
    });
  });
});
