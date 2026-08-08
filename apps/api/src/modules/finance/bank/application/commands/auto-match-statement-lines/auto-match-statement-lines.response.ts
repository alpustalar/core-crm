import { AutoMatchResult } from '@modules/finance/bank/domain/contracts/bank.contracts';

/**
 * Tarama turunun sayısal özeti. Command normalde `void` döner; burada istisna
 * geçerlidir çünkü sonuç bir iş akışı çıktısıdır: personel "kaç satır otomatik
 * kapandı, kaç satır hâlâ elimde" bilgisini görmeden bir sonraki adımı seçemez.
 */
export type AutoMatchStatementLinesResponse = AutoMatchResult;
