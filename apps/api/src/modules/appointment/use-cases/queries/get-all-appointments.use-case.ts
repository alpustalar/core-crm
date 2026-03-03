import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@modules/prisma/prisma.service';

@Injectable()
export class GetAllAppointmentsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(tx?: Prisma.TransactionClient) {
    const client = tx ?? this.prisma;
    return client;
  }
}
