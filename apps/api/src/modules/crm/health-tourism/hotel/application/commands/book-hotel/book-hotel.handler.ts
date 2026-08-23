import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { BookHotelCommand } from './book-hotel.command';
import { BookHotelResponse } from './book-hotel.response';
import {
  HOTELBEDS_API_SERVICE,
  IHotelbedsApiService,
} from '@modules/crm/health-tourism/hotel/domain/interfaces/hotelbeds-api.interface';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction';
import { HotelbedsBooking } from '@modules/crm/health-tourism/hotel/domain/entities/hotelbeds-booking.entity';
import { UUID } from '@src/domain/value-objects/uuid.vo';
import { HotelbedsBookingStatusSchema, ITenantScopeResolver } from '@shared';
import {
  HOTELBEDS_BOOKING_COMMAND_REPOSITORY,
  IHotelbedsBookingCommandRepository,
} from '@modules/crm/health-tourism/hotel/domain/repositories/hotelbeds-booking/hotelbeds-booking.command.repository';
import { TENANT_SCOPE_RESOLVER } from '@modules/organization/clinic/domain/services/tenant-scope/tenant-scope.resolver.interface';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';

@CommandHandler(BookHotelCommand)
export class BookHotelHandler
  implements ICommandHandler<BookHotelCommand, BookHotelResponse>
{
  constructor(
    @Inject(HOTELBEDS_API_SERVICE)
    private readonly hotelbedsApi: IHotelbedsApiService,
    @Inject(HOTELBEDS_BOOKING_COMMAND_REPOSITORY)
    private readonly hotelbedsBookingRepo: IHotelbedsBookingCommandRepository,
    @Inject(TENANT_SCOPE_RESOLVER)
    private readonly tenantScopeResolver: ITenantScopeResolver,
    private readonly txManager: TransactionManager,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(command: BookHotelCommand): Promise<BookHotelResponse> {
    const { data } = command;

    // `data.clinicId` istek gövdesinden geliyor: kontrol olmadan personel başka
    // kliniğin adına (ve onun komisyon/muhasebe kayıtlarına) rezervasyon açabilirdi.
    this.policyFactory
      .clinic(command.ctx.actor, command.ctx.source)
      .evaluator.check((p) => p.actorCanAccessTargetClinic(data.clinicId))
      .orThrow('health-tourism.booking');

    const generatedBookingUUID = UUID.generate();

    const apiResult = await this.hotelbedsApi.createBooking({
      holderName: data.holderName,
      holderSurname: data.holderSurname,
      rooms: data.rooms,
      clientReference: generatedBookingUUID.value,
      remarks: data.remarks,
    });

    const organizationId = await this.tenantScopeResolver.resolve(data);

    const bookingHotel = HotelbedsBooking.create({
      id: generatedBookingUUID.value,
      reference: apiResult.reference,
      clientReference: generatedBookingUUID.value,
      hotelCode: data.hotelCode,
      checkIn: data.checkIn,
      checkOut: data.checkOut,
      totalNet: apiResult.totalNet,
      currency: apiResult.currency,
      holderName: data.holderName,
      holderSurname: data.holderSurname,
      rooms: apiResult.rooms,
      patientId: data.patientId,
      leadId: data.leadId,
      remarks: data.remarks,
      serviceFee: data.serviceFee,
      clinicId: data.clinicId,
      status: HotelbedsBookingStatusSchema.enum.PENDING,
      organizationId,
      actorId: command.ctx.actor.userId,
      logSource: command.ctx.actor.source,
    });

    await this.txManager.run(async () => {
      return this.hotelbedsBookingRepo.create(bookingHotel);
    });

    return generatedBookingUUID.value;
  }
}
