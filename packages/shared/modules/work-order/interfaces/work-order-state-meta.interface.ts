/**
 * Geçersiz durum geçişi hatasının payload'ı. Frontend hangi eylemin hangi durumda
 * reddedildiğini ve hangi geçişlerin mümkün olduğunu kullanıcıya gösterebilsin diye
 * @shared'te tanımlanır (backend exception'ı ve frontend aynı tipi import eder).
 */
export interface WorkOrderStateMeta extends Record<string, unknown> {
  workOrderId: string;
  currentStatus: string;
  attemptedAction: string;
  allowedStatuses: string[];
}
