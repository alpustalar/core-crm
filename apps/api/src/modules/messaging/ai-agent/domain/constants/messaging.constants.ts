export const MessagingJobIds = {
  AI_REPLY: (messageId: string) => `ai:reply:${messageId}}`,
} as const;

export type MessagingJobId =
  (typeof MessagingJobIds)[keyof typeof MessagingJobIds];
