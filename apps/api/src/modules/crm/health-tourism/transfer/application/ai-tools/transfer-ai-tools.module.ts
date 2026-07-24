import { Module } from '@nestjs/common';
import { SearchTransfersTool } from './search-transfers.tool';
import { BookTransferTool } from './book-transfer.tool';
import { GetTransferBookingsTool } from './get-transfer-bookings.tool';
import { CancelTransferBookingTool } from './cancel-transfer-booking.tool';

/**
 * Transfer (HotelBeds) AI araçları. Her araç `@AiTool()` ile işaretlidir; merkezi
 * `AiToolRegistry` uygulama-geneli keşifle toplar. Araçlar dış modüllere yalnız
 * CommandBus/QueryBus ile gider; `AiToolSupport` global sağlanır — ek import gerekmez.
 */
export const TRANSFER_AI_TOOLS = [
  SearchTransfersTool,
  BookTransferTool,
  GetTransferBookingsTool,
  CancelTransferBookingTool,
];

@Module({
  providers: TRANSFER_AI_TOOLS,
})
export class TransferAiToolsModule {}
