import { JournalEntry } from '@modules/finance/accounting/posting/domain/entities/journal-entry.entity';
import { TrialBalanceRow } from '@modules/finance/accounting/posting/domain/repositories/journal.repository';
import { AccountResolver } from '@modules/finance/accounting/posting/domain/posting/account-resolver';
import { Account } from '@shared';

export interface GenerateClosingEntriesProps {
  clinicId: string;
  organizationId: string;
  periodId: string;
  entryDate: Date;
  performedById?: string | null;
  trialBalanceRows: TrialBalanceRow[];
  resolver: AccountResolver;
  accounts: Account[];
}
export interface IYearEndClosingService {
  generateClosingEntries(props: GenerateClosingEntriesProps): JournalEntry[];
  isResultAccount(code: string): boolean;
}
