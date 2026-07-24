import { BaseRules } from '@common/domain/rules/base.rules';
import { ValidateOptionsType } from '@shared/common/validate-options/validate-options.type';
import { DefaultValidateOptions } from '@common/domain/constants/default-options.constant';
import { PatientTreatmentPackage } from '@modules/clinical/treatment-package/domain/entities/patient-treatment-package.entity';

export class PatientTreatmentPackageRules extends BaseRules {
  constructor(
    private readonly patientTreatmentPackage: PatientTreatmentPackage,
    private readonly validateOptions: ValidateOptionsType = DefaultValidateOptions
  ) {
    super();
  }

  reactivate() {
    const valid =
      this.patientTreatmentPackage.validate.status.isCancelled.value;

    return this.evaluate(
      valid,
      () =>
        new Error(
          'Sadece iptal edilmiş paketler tekrar aktif hale getirilebilir'
        ),
      this.validateOptions
    );
  }
}
