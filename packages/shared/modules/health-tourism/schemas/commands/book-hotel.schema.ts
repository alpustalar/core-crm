import { z } from 'zod';

const PaxSchema = z.object({
  roomId: z.number().int().positive(),
  type: z.enum(['AD', 'CH']),
  name: z.string().min(1),
  surname: z.string().min(1),
  age: z.number().int().optional(),
});

const RoomRequestSchema = z.object({
  rateKey: z.string().min(1),
  paxes: z.array(PaxSchema).min(1),
});

export const BookHotelSchema = z.object({
  hotelCode: z.string().min(1),
  checkIn: z.coerce.date(),
  checkOut: z.coerce.date(),
  holderName: z.string().min(1),
  holderSurname: z.string().min(1),
  rooms: z.array(RoomRequestSchema).min(1),
  patientId: z.string().uuid().optional(),
  leadId: z.string().uuid().optional(),
  remarks: z.string().max(500).optional(),
  serviceFee: z.number().min(0).optional(),
});
