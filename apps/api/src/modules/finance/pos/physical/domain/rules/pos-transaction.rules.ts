import { BaseRules } from '@common/domain/rules/base.rules';
import { PosTransaction } from '@modules/finance/pos/physical/domain/entities/pos-transaction.entity';
import { ValidateOptionsType } from '@shared/common/validate-options/validate-options.type';

export class PosTransactionRules extends BaseRules {
  constructor(
    private readonly posTransaction: PosTransaction,
    private readonly validateOptions: ValidateOptionsType
  ) {
    super();
  }

  mark() {
    const valid = this.posTransaction.validate.status.isPending().value;

    return this.evaluate(
      valid,
      () => new Error('PosTransaction beklemede değil.'),
      this.validateOptions
    );
  }
}
