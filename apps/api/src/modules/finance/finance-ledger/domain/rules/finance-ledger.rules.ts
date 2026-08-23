import { BaseRules } from '@common/domain/rules/base.rules';
import { ValidateOptionsType } from '@shared/common/validate-options/validate-options.type';
import { DefaultValidateOptions } from '@common/domain/constants/default-options.constant';
import { FinanceLedgerEntity } from '@modules/finance/finance-ledger/domain/entities/finance-ledger.entity';

export class FinanceLedgerRules extends BaseRules {
  constructor(
    public readonly financeLedger: FinanceLedgerEntity,
    public readonly validateOptions: ValidateOptionsType = DefaultValidateOptions
  ) {
    super();
  }

  cancel() {
    const valid = this.financeLedger.validate.isRefunded().value;
    return this.evaluate(
      !valid,
      () => new Error('İade edilmiş kayıtlar iptal edilemez.')
    );
  }

  refund() {
    const valid = this.financeLedger.validate.isCompleted().value;
    return this.evaluate(
      valid,
      () => new Error('Yalnızca tamamlanmış kayıtlar iade edilebilir.')
    );
  }
}
