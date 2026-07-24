import { Module } from '@nestjs/common';
import { SuggestAppointmentSlotsTool } from './suggest-appointment-slots.tool';
import { BookAppointmentTool } from './book-appointment.tool';
import { GetPatientAppointmentsTool } from './get-patient-appointments.tool';
import { CancelAppointmentTool } from './cancel-appointment.tool';
import { RescheduleAppointmentTool } from './reschedule-appointment.tool';
import { ConfirmAppointmentTool } from './confirm-appointment.tool';

/**
 * Randevu AI araçları — her biri appointment modülünün komut/query'sini bus ile çağırır
 * (bu aracın "öz hakiki modülü" = dispatch ettiği verinin sahibi). `@AiTool()` ile
 * işaretli; merkezi `AiToolRegistry` uygulama-geneli keşifle toplar. Araçlar dış modüllere
 * yalnız CommandBus/QueryBus ile gider; paylaşılan `AiToolSupport` global sağlanır — ek
 * import gerekmez. Yeni araç = dosya + bu diziye bir satır.
 */
export const APPOINTMENT_AI_TOOLS = [
  SuggestAppointmentSlotsTool,
  BookAppointmentTool,
  GetPatientAppointmentsTool,
  CancelAppointmentTool,
  RescheduleAppointmentTool,
  ConfirmAppointmentTool,
];

@Module({
  providers: APPOINTMENT_AI_TOOLS,
})
export class AppointmentAiToolsModule {}
