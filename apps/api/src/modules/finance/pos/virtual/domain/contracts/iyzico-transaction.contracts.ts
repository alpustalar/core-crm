import { z } from 'zod';

/**
 * IyzicoTransaction domain kontratları. Entity static `create` girişi (Props) ve durum
 * geçişi metod girdileri burada toplanır
 */

// Entity static create() girişi → Props
export const CreateIyzicoTransactionSchema = z.object({
  id: z.uuid().optional(),
  installmentId: z.uuid(),
  conversationId: z.uuid(),
  token: z.string().optional(),
});
export type CreateIyzicoTransactionProps = z.infer<
  typeof CreateIyzicoTransactionSchema
>;

/** markAsSuccess girdisi — iyzico ödeme kimlikleri + ham yanıt. */
export interface MarkIyzicoSuccessInput {
  iyzicoPaymentId: string;
  iyzicoPaymentTransactionId?: string;
  rawResponse?: unknown;
}

/** markAsFailed girdisi — hata kodu/mesajı + ham yanıt. */
export interface MarkIyzicoFailedInput {
  errorCode?: string;
  errorMessage?: string;
  rawResponse?: unknown;
}

/** markAsRefunded girdisi — ham iade yanıtı. */
export interface MarkIyzicoRefundedInput {
  rawResponse?: unknown;
}
