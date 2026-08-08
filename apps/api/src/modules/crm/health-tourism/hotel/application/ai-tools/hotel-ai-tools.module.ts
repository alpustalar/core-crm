import { Module } from '@nestjs/common';
import { SearchHotelsTool } from './search-hotels.tool';
import { BookHotelTool } from './book-hotel.tool';
import { GetHotelBookingsTool } from './get-hotel-bookings.tool';
import { CancelHotelBookingTool } from './cancel-hotel-booking.tool';

/**
 * Otel (HotelBeds) AI araçları. Her araç `@AiTool()` ile işaretlidir; merkezi
 * `AiToolRegistry` uygulama-geneli keşifle toplar. Araçlar dış modüllere yalnız
 * CommandBus/QueryBus ile gider; `AiToolSupport` global sağlanır — ek import gerekmez.
 */
export const HOTEL_AI_TOOLS = [
  SearchHotelsTool,
  BookHotelTool,
  GetHotelBookingsTool,
  CancelHotelBookingTool,
];

@Module({
  providers: HOTEL_AI_TOOLS,
  exports: HOTEL_AI_TOOLS,
})
export class HotelAiToolsModule {}
