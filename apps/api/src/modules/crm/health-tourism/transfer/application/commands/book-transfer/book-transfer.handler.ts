import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { BookTransferCommand } from './book-transfer.command';
import { BookTransferResponse } from './book-transfer.response';
import {
  HOTELBEDS_TRANSFER_API_SERVICE,
  IHotelbedsTransferApiService,
} from '@modules/crm/health-tourism/transfer/domain/interfaces/hotelbeds-transfer-api.interface';
import {
  HOTELBEDS_TRANSFER_BOOKING_COMMAND_REPOSITORY,
  IHotelbedsTransferBookingCommandRepository,
} from '@modules/crm/health-tourism/transfer/domain/repositories/hotelbeds-transfer-booking.repository.interface';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction';
import { Currency } from '@src/domain/value-objects/currency.vo';
import { HotelbedsTransferBooking } from '@modules/crm/health-tourism/transfer/domain/entities/hotelbeds-transfer-booking.entity';
import { HotelbedsTransferBookingStatusSchema } from '@shared';
import { JsonValueType } from '@input-type-schemas/JsonValueSchema';

@CommandHandler(BookTransferCommand)
export class BookTransferHandler
  implements ICommandHandler<BookTransferCommand, BookTransferResponse>
{
  constructor(
    @Inject(HOTELBEDS_TRANSFER_API_SERVICE)
    private readonly transferApi: IHotelbedsTransferApiService,

    @Inject(HOTELBEDS_TRANSFER_BOOKING_COMMAND_REPOSITORY)
    private readonly bookingCommandRepo: IHotelbedsTransferBookingCommandRepository,

    private readonly txManager: TransactionManager
  ) {}

  async execute(command: BookTransferCommand): Promise<BookTransferResponse> {
    const { dto, ctx } = command;
    const { actor } = ctx;

    const clientReference = `${actor.organizationId!.slice(0, 8)}-${randomUUID().slice(0, 8)}`;

    const result = await this.transferApi.createBooking({
      language: dto.language,
      holder: {
        name: dto.holderName,
        surname: dto.holderSurname,
        email: dto.holderEmail,
        phone: dto.holderPhone,
      },
      transfers: dto.transfers,
      clientReference,
      welcomeMessage: dto.welcomeMessage,
      remark: dto.remark,
    });

    const transferBooking = HotelbedsTransferBooking.create({
      reference: result.reference,
      clientReference,
      status: HotelbedsTransferBookingStatusSchema.parse(result.status),
      holderName: dto.holderName,
      holderSurname: dto.holderSurname,
      holderEmail: dto.holderEmail,
      holderPhone: dto.holderPhone,
      transfers: result.transfers as JsonValueType,
      totalAmount: result.totalAmount,
      currency: Currency.create(result.currency).orThrow().value,
      remarks: dto.remark,
      organizationId: actor.organizationId!,
      clinicId: dto.clinicId ?? actor.clinicId ?? undefined,
      patientId: dto.patientId,
      leadId: dto.leadId,
    });

    const booking = await this.txManager.run(async () => {
      return this.bookingCommandRepo.save(transferBooking);
    });

    return booking.id.value;
  }
}
