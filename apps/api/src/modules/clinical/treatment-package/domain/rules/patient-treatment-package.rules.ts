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

  suspend() {
    const valid =
      this.patientTreatmentPackage.validate.status.isActive.value &&
      !this.patientTreatmentPackage.validate.status.isExpired.value;

    return this.evaluate(
      valid,
      () =>
        new Error('Sadece aktif veya süresi geçmiş paketler askıya alınabilir')
    );
  }

  cancel() {
    const valid =
      !this.patientTreatmentPackage.validate.status.isCompleted.value &&
      !this.patientTreatmentPackage.validate.status.isCancelled.value;

    return this.evaluate(
      valid,
      () =>
        new Error(
          'Sadece tamamlanmamış ve daha önce iptal edilmemiş paketler iptal edilebilir'
        )
    );
  }

  complete() {
    const valid =
      this.patientTreatmentPackage.validate.status.isActive.value &&
      !this.patientTreatmentPackage.validate.status.isExpired.value;
    return this.evaluate(
      valid,
      () => new Error('Bu paket tamamlanabilir değil')
    );
  }
}
