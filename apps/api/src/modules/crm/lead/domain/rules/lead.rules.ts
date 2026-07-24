// Kendi path'ine göre ayarla

import { ILeadRules } from '@modules/crm/lead/domain/interfaces/lead-rules.interface';
import { BaseRules } from '@common/domain/rules/base.rules';
import { Lead } from '@modules/crm/lead/domain/entities/lead.entity';
import { ValidateOptionsType } from '@shared/common/validate-options/validate-options.type';
import { DefaultValidateOptions } from '@common/domain/constants/default-options.constant';
import { Validate } from '@common/interfaces';
import { LeadStatusSchema } from '@shared';
import {
  InvalidLeadStatusTransitionException,
  LeadAlreadyFinalizedException,
} from '@modules/crm/lead/domain/exceptions/lead.exceptions';

export class LeadRules extends BaseRules implements ILeadRules {
  constructor(
    private readonly lead: Lead,
    private readonly validateOptions: ValidateOptionsType = DefaultValidateOptions
  ) {
    super();
  }

  /** Lead'i başarıyla müşteriye dönüştürme (Convert) kurallarını doğrular */
  public convert(): Validate {
    const isFinalized =
      this.lead.status === LeadStatusSchema.enum.CONVERTED ||
      this.lead.status === LeadStatusSchema.enum.LOST;

    return this.evaluate(
      !isFinalized,
      () => new LeadAlreadyFinalizedException(),
      this.validateOptions
    );
  }

  /** Lead'i "Kaybedildi" (Lost) olarak işaretleme kurallarını doğrular */
  public markLost(): Validate {
    const isFinalized =
      this.lead.status === LeadStatusSchema.enum.CONVERTED ||
      this.lead.status === LeadStatusSchema.enum.LOST;

    return this.evaluate(
      !isFinalized,
      () => new LeadAlreadyFinalizedException(),
      this.validateOptions
    );
  }

  /** Lead'i "Nitelikli" (Qualify) statüsüne geçirme kurallarını doğrular */
  public qualify(): Validate {
    const isInvalid = this.lead.status !== LeadStatusSchema.enum.CONTACTED;

    return this.evaluate(
      !isInvalid,
      () =>
        new InvalidLeadStatusTransitionException(
          LeadStatusSchema.enum.CONTACTED
        ),
      this.validateOptions
    );
  }

  /** Lead ile "İletişime Geçildi" (Contact) statüsüne geçirme kurallarını doğrular */
  public contact(): Validate {
    const isInvalid = this.lead.status !== LeadStatusSchema.enum.NEW;

    return this.evaluate(
      !isInvalid,
      () =>
        new InvalidLeadStatusTransitionException(
          this.lead.status,
          LeadStatusSchema.enum.NEW
        ),
      this.validateOptions
    );
  }
}
