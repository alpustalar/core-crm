/**
 * Bir faturanın e-belge gönderimini kuyruğa alır (doc 07 §5). issue-invoice fişi
 * yazdıktan sonra bunu CommandBus ile dispatch eder; gönderim async işlenir,
 * fatura akışını bloklamaz.
 */
export class QueueEDocumentCommand {
  readonly __responseType!: void;
  constructor(public readonly invoiceId: string) {}
}
