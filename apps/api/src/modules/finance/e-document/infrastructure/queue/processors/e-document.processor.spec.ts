import { Job } from 'bullmq';
import { EDocumentProcessor } from './e-document.processor';
import { EInvoicePort } from '@modules/finance/e-document/domain/ports/e-invoice.port';
import { EDocumentRequest } from '@modules/finance/e-document/domain/contracts/e-document.contracts';
import { GetInvoiceByIdQuery } from '@modules/finance/invoice/application/queries/get-invoice-by-id/get-invoice-by-id.query';
import { GetClinicGovernmentSpecsQuery } from '@modules/organization/clinic-governance/application/queries/get-clinic-government-specs/get-clinic-government-specs.query';
import { GetPartyByIdQuery } from '@modules/finance/party/application/queries/get-party-by-id/get-party-by-id.query';
import { EnsurePartyForPatientCommand } from '@modules/finance/party/application/commands/ensure-party-for-patient/ensure-party-for-patient.command';
import { MarkInvoiceEDocumentResultCommand } from '@modules/finance/invoice/application/commands/mark-invoice-edocument-result/mark-invoice-edocument-result.command';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { E_DOCUMENT_JOBS } from '@common/constants';
import { EDocumentTypeSchema } from '@input-type-schemas/EDocumentTypeSchema';
import { EDocumentStatusSchema } from '@input-type-schemas/EDocumentStatusSchema';

describe('EDocumentProcessor (doc 07 §5)', () => {
  const invoiceView = {
    id: 'inv-1',
    clinicId: 'clinic-1',
    patientId: 'patient-1',
    netTotal: '1000.00',
    vatTotal: '100.00',
    grandTotal: '1100.00',
    vatRate: 10,
    currency: 'TRY' as const,
    issuedAt: new Date('2026-06-18'),
    status: 'PENDING' as const,
  };

  const buyer = {
    name: 'Hasta Adı',
    taxNumber: null,
    nationalId: '11111111111',
    isEInvoiceUser: false,
    eInvoiceMailbox: null,
  };

  const buildProcessor = (params: {
    legalType: 'KURUM' | 'SERBEST_MESLEK';
    buyerIsEInvoiceUser?: boolean;
    issue: EInvoicePort['issue'];
  }) => {
    const port: EInvoicePort = {
      issue: params.issue,
      cancel: jest.fn(),
      getStatus: jest.fn(),
      checkMailbox: jest.fn(),
    };

    const queryBus = {
      execute: jest.fn(async (query: unknown) => {
        if (query instanceof GetInvoiceByIdQuery) return { data: invoiceView };
        if (query instanceof GetClinicGovernmentSpecsQuery) {
          return {
            data: {
              legalType: params.legalType,
              companyTaxNumber: '1234567890',
            },
          };
        }
        if (query instanceof GetPartyByIdQuery) {
          return {
            data: {
              ...buyer,
              isEInvoiceUser: params.buyerIsEInvoiceUser ?? false,
            },
          };
        }
        return { data: null };
      }),
    } as unknown as TSQueryBus;

    const commandBus = {
      execute: jest.fn(async (cmd: unknown) => {
        if (cmd instanceof EnsurePartyForPatientCommand) {
          return { partyId: 'party-1', organizationId: 'org-1' };
        }
        return undefined;
      }),
    } as unknown as TSCommandBus;

    const processor = new EDocumentProcessor(port, commandBus, queryBus);
    return { processor, port, queryBus, commandBus };
  };

  const sendJob = (invoiceId = 'inv-1') =>
    ({ name: E_DOCUMENT_JOBS.SEND, data: { invoiceId } }) as Job;

  it('KURUM + bireysel → port E_ARSIV isteğiyle çağrılır, sonuç faturaya işlenir', async () => {
    const issue = jest.fn().mockResolvedValue({
      documentType: EDocumentTypeSchema.enum.INTERNAL,
      uuid: null,
      status: EDocumentStatusSchema.enum.INTERNAL,
      invoiceNumber: null,
    });
    const { processor, commandBus } = buildProcessor({
      legalType: 'KURUM',
      buyerIsEInvoiceUser: false,
      issue,
    });

    await processor.process(sendJob());

    const request = issue.mock.calls[0][0] as EDocumentRequest;
    expect(request.type).toBe(EDocumentTypeSchema.enum.E_ARSIV);
    expect(request.invoiceId).toBe('inv-1');
    expect(request.seller.taxId).toBe('1234567890');
    expect(request.buyer.taxId).toBe('11111111111');
    expect(request.lines[0].unitPrice).toBe('1000.00');
    expect(request.totals.payable).toBe('1100.00');
    expect(request.currency).toBe('TRY');

    const markCall = (commandBus.execute as jest.Mock).mock.calls.find(
      ([c]) => c instanceof MarkInvoiceEDocumentResultCommand
    );
    expect(markCall).toBeDefined();
    const markCmd = markCall![0] as MarkInvoiceEDocumentResultCommand;
    expect(markCmd.input.invoiceId).toBe('inv-1');
    expect(markCmd.input.status).toBe(EDocumentStatusSchema.enum.INTERNAL);
    expect(markCmd.input.documentType).toBe(EDocumentTypeSchema.enum.INTERNAL);
  });

  it('SERBEST_MESLEK → port E_SMM isteğiyle çağrılır', async () => {
    const issue = jest.fn().mockResolvedValue({
      documentType: EDocumentTypeSchema.enum.INTERNAL,
      uuid: null,
      status: EDocumentStatusSchema.enum.INTERNAL,
      invoiceNumber: null,
    });
    const { processor } = buildProcessor({
      legalType: 'SERBEST_MESLEK',
      issue,
    });

    await processor.process(sendJob());

    const request = issue.mock.calls[0][0] as EDocumentRequest;
    expect(request.type).toBe(EDocumentTypeSchema.enum.E_SMM);
  });

  it('fatura bulunamazsa port çağrılmaz, sessizce çıkar', async () => {
    const issue = jest.fn();
    const port: EInvoicePort = {
      issue,
      cancel: jest.fn(),
      getStatus: jest.fn(),
      checkMailbox: jest.fn(),
    };
    const queryBus = {
      execute: jest.fn(async () => ({ data: null })),
    } as unknown as TSQueryBus;
    const commandBus = {
      execute: jest.fn(),
    } as unknown as TSCommandBus;

    const processor = new EDocumentProcessor(port, commandBus, queryBus);
    await processor.process(sendJob('yok'));

    expect(issue).not.toHaveBeenCalled();
  });
});
