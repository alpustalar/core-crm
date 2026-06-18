import { TaxParameterKeyType } from '@input-type-schemas/TaxParameterKeySchema';

export class TaxParameterNotConfiguredException extends Error {
  constructor(clinicId: string, key: TaxParameterKeyType) {
    super(
      `Vergi parametresi yapılandırılmamış: clinicId=${clinicId}, key=${key}. Klinik kayıt akışında InitializeTaxParametersCommand çalışmamış olabilir.`
    );
    this.name = 'TaxParameterNotConfiguredException';
  }
}
