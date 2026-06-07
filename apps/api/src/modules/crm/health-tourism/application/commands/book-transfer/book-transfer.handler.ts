import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { BookTransferCommand } from './book-transfer.command';
import { BookTransferResponse } from './book-transfer.response';
import {
  HOTELBEDS_TRANSFER_API_SERVICE,
  IHotelbedsTransferApiService,
} from '@modules/crm/health-tourism/domain/interfaces/hotelbeds-transfer-api.interface';
import {
  HOTELBEDS_TRANSFER_BOOKING_COMMAND_REPOSITORY,
  IHotelbedsTransferBookingCommandRepository,
} from '@modules/crm/health-tourism/domain/repositories/hotelbeds-transfer-booking.repository.interface';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction';

@CommandHandler(BookTransferCommand)
export class BookTransferHandler
  implements ICommandHandler<BookTransferCommand, BookTransferResponse>
{
  constructor(
    @Inject(HOTELBEDS_TRANSFER_API_SERVICE)
    private readonly transferApi: IHotelbedsTransferApiService,

    @Inject(HOTELBEDS_TRANSFER_BOOKING_COMMAND_REPOSITORY)
    private readonly bookingCommandRepo: IHotelbedsTransferBookingCommandRepository,

    private readonly txManager: TransactionManager,
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

    const bookingId = randomUUID();

    const booking = await this.txManager.run(async () => {
      return this.bookingCommandRepo.create({
        id: bookingId,
        reference: result.reference,
        clientReference,
        holderName: dto.holderName,
        holderSurname: dto.holderSurname,
        holderEmail: dto.holderEmail,
        holderPhone: dto.holderPhone,
        transfers: result.transfers,
        totalAmount: result.totalAmount,
        currency: result.currency,
        remarks: dto.remark,
        organizationId: actor.organizationId!,
        clinicId: dto.clinicId ?? actor.clinicId ?? undefined,
        patientId: dto.patientId,
        leadId: dto.leadId,
      });
    });

    return {
      id: booking.id,
      reference: booking.reference,
      totalAmount: Number(booking.totalAmount),
      currency: booking.currency,
      status: booking.status,
    };
  }
}
