import { BaseRules } from '@common/domain/rules/base.rules';
import { ValidateOptionsType } from '@shared/common/validate-options/validate-options.type';
import { DayMinuteRange } from '@src/domain/value-objects/day-minute-range.vo';
import { isDefined } from '@common/utils';
import { ProviderAvailability } from '@modules/clinical/provider/domain/entities/provider-availability.entity';
import { BreakTimeOutOfRangeException } from '@modules/clinical/provider/domain/exceptions/provider-availability.exceptions';
import { UpdateProviderAvailabilityProps } from '@modules/clinical/provider/domain/contracts';
import { DefaultValidateOptions } from '@common/domain/constants/default-options.constant';

export class ProviderAvailabilityRules extends BaseRules {
  constructor(
    private readonly providerAvailability: ProviderAvailability,
    private readonly validateOptions: ValidateOptionsType = DefaultValidateOptions
  ) {
    super();
  }

  upload(props: UpdateProviderAvailabilityProps) {
    const startMinute =
      props.startMinute ?? this.providerAvailability.startMinute;
    const endMinute = props.endMinute ?? this.providerAvailability.endMinute;

    const availabilityRange = DayMinuteRange.fromNumbers(
      startMinute,
      endMinute
    );

    const breakStartMinute =
      props.breakStartMinute ?? this.providerAvailability.breakStartMinute;
    const breakEndMinute =
      props.breakEndMinute ?? this.providerAvailability.breakEndMinute;

    const breakRange =
      isDefined(breakStartMinute) && isDefined(breakEndMinute)
        ? DayMinuteRange.fromNumbers(breakStartMinute, breakEndMinute)
        : null;

    const isInvalid = !!(
      this.providerAvailability.breakRange &&
      !breakRange?.validate.isCompletelyWithIn(availabilityRange).value
    );

    return this.evaluate(
      !isInvalid,
      () =>
        new BreakTimeOutOfRangeException(
          breakRange?.start.toString() ?? 'Belirsiz',
          breakRange?.end.toString() ?? 'Belirsiz',
          this.providerAvailability.availabilityRange.start.toString(),
          this.providerAvailability.availabilityRange.end.toString()
        ),
      this.validateOptions
    );
  }
}
