/**
 * Yaklaşan onaylı randevuları tarayıp (klinik-başına `sendSmsReminderHours`
 * penceresi) hatırlatma tetikler. Zamanlanmış BullMQ işinden dispatch edilir;
 * aktör bağlamı yoktur (sistem işi). `reminderSentAt` ile tekrar gönderim önlenir.
 */
export class ProcessAppointmentRemindersCommand {
  readonly __responseType!: void;
}
