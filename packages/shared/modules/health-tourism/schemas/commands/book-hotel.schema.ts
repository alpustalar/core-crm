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
  patientId: z.uuid(),
  leadId: z.uuid().optional(),
  remarks: z.string().max(500).optional(),
  serviceFee: z.number().min(0).optional(),
  clinicId: z.uuid(),
  organizationId: z.uuid(),
  // Ödeme-önce saga'yı baypas eden manuel override: ödeme kanal dışı (havale/nakit vb.)
  // tahsil edildiyse personel bilinçli olarak true gönderir; aksi halde direkt booking reddedilir.
  manualOverride: z.boolean().optional().default(false),
});
