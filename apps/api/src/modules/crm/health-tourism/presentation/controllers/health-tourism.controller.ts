import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@modules/identity/auth/auth/guards';
import { GetContext, IGetContext } from '@common/decorators';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import {
  BookHotelDto,
  CancelHotelBookingDto,
  BookTransferDto,
  CancelTransferBookingDto,
} from '@shared/modules/health-tourism/dto/commands';
import {
  GetHotelBookingsDto,
  SearchHotelsDto,
  SearchTransferAvailabilityDto,
  GetTransferBookingsDto,
} from '@shared/modules/health-tourism/dto/queries';
import { BookHotelCommand } from '@modules/crm/health-tourism/application/commands/book-hotel/book-hotel.command';
import { CancelHotelBookingCommand } from '@modules/crm/health-tourism/application/commands/cancel-hotel-booking/cancel-hotel-booking.command';
import { BookTransferCommand } from '@modules/crm/health-tourism/application/commands/book-transfer/book-transfer.command';
import { CancelTransferBookingCommand } from '@modules/crm/health-tourism/application/commands/cancel-transfer-booking/cancel-transfer-booking.command';
import { SearchHotelsQuery } from '@modules/crm/health-tourism/application/queries/search-hotels/search-hotels.query';
import { GetHotelBookingsQuery } from '@modules/crm/health-tourism/application/queries/get-hotel-bookings/get-hotel-bookings.query';
import { GetHotelBookingByIdQuery } from '@modules/crm/health-tourism/application/queries/get-hotel-booking-by-id/get-hotel-booking-by-id.query';
import { SearchTransferAvailabilityQuery } from '@modules/crm/health-tourism/application/queries/search-transfer-availability/search-transfer-availability.query';
import { GetTransferBookingsQuery } from '@modules/crm/health-tourism/application/queries/get-transfer-bookings/get-transfer-bookings.query';
import { GetTransferBookingByIdQuery } from '@modules/crm/health-tourism/application/queries/get-transfer-booking-by-id/get-transfer-booking-by-id.query';

@UseGuards(AuthGuard)
@Controller()
export class HealthTourismController {
  constructor(
    private readonly commandBus: TSCommandBus,
    private readonly queryBus: TSQueryBus,
  ) {}

  @Get('health-tourism/hotels/search')
  searchHotels(
    @Query() dto: SearchHotelsDto,
    @GetContext() ctx: IGetContext,
  ) {
    return this.queryBus.execute(new SearchHotelsQuery(dto, ctx));
  }

  @Post('health-tourism/bookings')
  bookHotel(
    @Body() dto: BookHotelDto,
    @GetContext() ctx: IGetContext,
  ) {
    return this.commandBus.execute(new BookHotelCommand(dto, ctx));
  }

  @Delete('health-tourism/bookings/:bookingId')
  cancelBooking(
    @Param('bookingId', ParseUUIDPipe) bookingId: string,
    @GetContext() ctx: IGetContext,
  ) {
    const dto = { bookingId } as CancelHotelBookingDto;
    return this.commandBus.execute(new CancelHotelBookingCommand(dto, ctx));
  }

  @Get('health-tourism/bookings')
  getBookings(
    @Query() dto: GetHotelBookingsDto,
    @GetContext() ctx: IGetContext,
  ) {
    return this.queryBus.execute(new GetHotelBookingsQuery(dto, ctx));
  }

  @Get('health-tourism/bookings/:bookingId')
  getBookingById(
    @Param('bookingId', ParseUUIDPipe) bookingId: string,
    @GetContext() ctx: IGetContext,
  ) {
    return this.queryBus.execute(new GetHotelBookingByIdQuery(bookingId, ctx));
  }

  // ─── Transfer Endpoints ───────────────────────────────────────────────────

  @Get('health-tourism/transfers/availability')
  searchTransferAvailability(
    @Query() dto: SearchTransferAvailabilityDto,
    @GetContext() ctx: IGetContext,
  ) {
    return this.queryBus.execute(new SearchTransferAvailabilityQuery(dto, ctx));
  }

  @Post('health-tourism/transfers/bookings')
  bookTransfer(
    @Body() dto: BookTransferDto,
    @GetContext() ctx: IGetContext,
  ) {
    return this.commandBus.execute(new BookTransferCommand(dto, ctx));
  }

  @Delete('health-tourism/transfers/bookings/:reference')
  cancelTransferBooking(
    @Param('reference') reference: string,
    @Body() dto: CancelTransferBookingDto,
    @GetContext() ctx: IGetContext,
  ) {
    const cancelDto = { ...dto, reference } as CancelTransferBookingDto;
    return this.commandBus.execute(
      new CancelTransferBookingCommand(cancelDto, ctx),
    );
  }

  @Get('health-tourism/transfers/bookings')
  getTransferBookings(
    @Query() dto: GetTransferBookingsDto,
    @GetContext() ctx: IGetContext,
  ) {
    return this.queryBus.execute(new GetTransferBookingsQuery(dto, ctx));
  }

  @Get('health-tourism/transfers/bookings/:bookingId')
  getTransferBookingById(
    @Param('bookingId', ParseUUIDPipe) bookingId: string,
    @GetContext() ctx: IGetContext,
  ) {
    return this.queryBus.execute(
      new GetTransferBookingByIdQuery(bookingId, ctx),
    );
  }
}
