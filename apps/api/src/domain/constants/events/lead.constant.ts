export const LEAD_EVENTS = {
  CREATED: 'lead.created',
  STATUS_CHANGED: 'lead.status.changed',
  CONVERTED: 'lead.converted',
  LOST: 'lead.lost',
  DETAIL: 'lead.detail',
  LIST: 'lead.list',
} as const;

export type LeadEvent = (typeof LEAD_EVENTS)[keyof typeof LEAD_EVENTS];
