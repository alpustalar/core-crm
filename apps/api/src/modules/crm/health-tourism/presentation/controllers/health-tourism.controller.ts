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
import { BookHotelDto, CancelHotelBookingDto } from '@shared/modules/health-tourism/dto/commands';
import { GetHotelBookingsDto, SearchHotelsDto } from '@shared/modules/health-tourism/dto/queries';
import { BookHotelCommand } from '@modules/crm/health-tourism/application/commands/book-hotel/book-hotel.command';
import { CancelHotelBookingCommand } from '@modules/crm/health-tourism/application/commands/cancel-hotel-booking/cancel-hotel-booking.command';
import { SearchHotelsQuery } from '@modules/crm/health-tourism/application/queries/search-hotels/search-hotels.query';
import { GetHotelBookingsQuery } from '@modules/crm/health-tourism/application/queries/get-hotel-bookings/get-hotel-bookings.query';
import { GetHotelBookingByIdQuery } from '@modules/crm/health-tourism/application/queries/get-hotel-booking-by-id/get-hotel-booking-by-id.query';

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
}
