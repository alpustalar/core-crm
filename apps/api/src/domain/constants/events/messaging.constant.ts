export const MESSAGING_EVENTS = {
  MESSAGE_RECEIVED: 'messaging.message.received',
  MESSAGE_STATUS_CHANGED: 'messaging.message.status_changed',
} as const;

export type MessagingEvent =
  (typeof MESSAGING_EVENTS)[keyof typeof MESSAGING_EVENTS];
