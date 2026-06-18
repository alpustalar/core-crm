import { resolveDocumentType } from './document-type-resolver';
import { EDocumentTypeSchema } from '@input-type-schemas/EDocumentTypeSchema';

describe('resolveDocumentType (doc 07 §2)', () => {
  it('SERBEST_MESLEK klinik → E_SMM (alıcı tipi fark etmez)', () => {
    expect(
      resolveDocumentType({
        legalType: 'SERBEST_MESLEK',
        buyerIsEInvoiceUser: false,
      })
    ).toBe(EDocumentTypeSchema.enum.E_SMM);

    expect(
      resolveDocumentType({
        legalType: 'SERBEST_MESLEK',
        buyerIsEInvoiceUser: true,
      })
    ).toBe(EDocumentTypeSchema.enum.E_SMM);
  });

  it('KURUM + alıcı e-Fatura mükellefi → E_FATURA', () => {
    expect(
      resolveDocumentType({ legalType: 'KURUM', buyerIsEInvoiceUser: true })
    ).toBe(EDocumentTypeSchema.enum.E_FATURA);
  });

  it('KURUM + bireysel (nihai tüketici) → E_ARSIV', () => {
    expect(
      resolveDocumentType({ legalType: 'KURUM', buyerIsEInvoiceUser: false })
    ).toBe(EDocumentTypeSchema.enum.E_ARSIV);
  });
});
