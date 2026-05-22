import { Prisma } from '@prisma/client';

export type AppointmentWithDetails = Prisma.AppointmentGetPayload<{
  include: {
    patient: true;
    provider: { include: { user: true } };
    treatment: true;
    clinic: true;
  };
}>;
