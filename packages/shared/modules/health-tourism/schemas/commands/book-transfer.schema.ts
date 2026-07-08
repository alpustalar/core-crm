import { z } from 'zod';

const TransferDetailSchema = z.object({
  type: z.enum(['FLIGHT', 'CRUISE', 'TRAIN']),
  direction: z.enum(['ARRIVAL', 'DEPARTURE']),
  code: z.string().min(1).max(7),
  companyName: z.string().max(100).nullish(),
});

const TransferExtraSchema = z.object({
  units: z.string().min(1),
  code: z.string().min(1),
});

const PickupInformationSchema = z.object({
  name: z.string().optional(),
  address: z.string().optional(),
  town: z.string().optional(),
  country: z.string().optional(),
  zip: z.string().optional(),
});

const TransferBookingInputSchema = z.object({
  rateKey: z.string().min(1),
  transferDetails: z.array(TransferDetailSchema).min(1),
  extras: z.array(TransferExtraSchema).optional(),
  pickupInformation: PickupInformationSchema.optional(),
});

export const BookTransferSchema = z.object({
  language: z.string().default('en'),
  holderName: z.string().min(1),
  holderSurname: z.string().min(1),
  holderEmail: z.string().email(),
  holderPhone: z.string().min(1),
  transfers: z.array(TransferBookingInputSchema).min(1),
  welcomeMessage: z.string().max(500).optional(),
  remark: z.string().max(2000).optional(),
  patientId: z.string().uuid().optional(),
  leadId: z.string().uuid().optional(),
  clinicId: z.string().uuid().optional(),
  // Ödeme-önce saga'yı baypas eden manuel override: ödeme kanal dışı (havale/nakit vb.)
  // tahsil edildiyse personel bilinçli olarak true gönderir; aksi halde direkt booking reddedilir.
  manualOverride: z.boolean().optional().default(false),
});
