import { BaseRules } from '@common/domain/rules/base.rules';
import { HotelbedsTransferBooking } from '@modules/crm/health-tourism/transfer/domain/entities/hotelbeds-transfer-booking.entity';
import { ValidateOptionsType } from '@shared/common/validate-options/validate-options.type';
import { DefaultValidateOptions } from '@common/domain/constants/default-options.constant';

export class HotelbedsTransferBookingRules extends BaseRules {
  constructor(
    private readonly hotelbedsTransferBooking: HotelbedsTransferBooking,
    private readonly validateOptions: ValidateOptionsType = DefaultValidateOptions
  ) {
    super();
  }

  updateHolderDetails() {
    const isInvalid =
      this.hotelbedsTransferBooking.validate.status.isCancelled.value;

    return this.evaluate(
      !isInvalid,
      () =>
        new Error(
          'İptal edilmiş bir transfer rezervasyonunun bilgileri güncellenemez.'
        ),
      this.validateOptions
    );
  }
}
