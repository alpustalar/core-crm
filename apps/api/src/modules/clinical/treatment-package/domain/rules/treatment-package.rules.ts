import { BaseRules } from '@common/domain/rules/base.rules';
import { ValidateOptionsType } from '@shared/common/validate-options/validate-options.type';
import { DefaultValidateOptions } from '@common/domain/constants/default-options.constant';
import {
  CreateTreatmentPackageProps,
  UpdateTreatmentPackageProps,
} from '@modules/clinical/treatment-package/domain/contracts/treatment-package.contracts';
import { isNotUndefined } from '@common/utils/is-not-undefined';
import { TreatmentPackageAlreadyDeletedException } from '@modules/clinical/treatment-package/domain/exceptions/treatment-package.exceptions';
import { isDefined } from '@common/utils';
import { TreatmentPackage } from '@modules/clinical/treatment-package/domain/entities/treatment-package.entity';
import { InvalidMoneyAmountException } from '@src/domain/exceptions';

export class TreatmentPackageRules extends BaseRules {
  constructor(
    private readonly treatmentPackage: TreatmentPackage,
    private readonly validateOptions: ValidateOptionsType = DefaultValidateOptions
  ) {
    super();
  }

  create(props: CreateTreatmentPackageProps) {
    const isValid = props.price.validate.greaterThanZero.isValid;
    return this.evaluate(
      isValid,
      () => new Error('Tedavi paket fiyatı sıfırdan büyük olmak zorundadır.'),
      this.validateOptions
    );
  }

  update(props: UpdateTreatmentPackageProps) {
    let isValid = true;
    let error: Error;
    if (isNotUndefined(props.price))
      isValid = props.price.validate.greaterThanZero.isValid;
    error = new InvalidMoneyAmountException(
      'Tedavi paket fiyatı negatif olamaz'
    );

    if (isDefined(this.treatmentPackage.deletedAt)) {
      isValid = false;
      error = new TreatmentPackageAlreadyDeletedException();
    }

    return this.evaluate(isValid, () => error, this.validateOptions);
  }
}
