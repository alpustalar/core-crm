import { BaseRules } from '@common/domain/rules/base.rules';
import { HotelbedsBooking } from '@modules/crm/health-tourism/hotel/domain/entities/hotelbeds-booking.entity';
import { ValidateOptionsType } from '@shared/common/validate-options/validate-options.type';
import { DefaultValidateOptions } from '@common/domain/constants/default-options.constant';
import { CreateHotelbedsBookingProps } from '@modules/crm/health-tourism/hotel/domain/contracts/hotel.contracts';

export class HotelbedsBookingRules extends BaseRules {
  constructor(
    private readonly hotelbedsBooking: HotelbedsBooking,
    private readonly validateOptions: ValidateOptionsType = DefaultValidateOptions
  ) {
    super();
  }

  create(props: Pick<CreateHotelbedsBookingProps, 'checkIn' | 'checkOut'>) {
    const isValid = props.checkOut > props.checkIn;

    return this.evaluate(
      isValid,
      () =>
        new Error(
          'Check-out tarihi, check-in tarihinden önce veya eşit olamaz.'
        ),
      this.validateOptions
    );
  }
}
