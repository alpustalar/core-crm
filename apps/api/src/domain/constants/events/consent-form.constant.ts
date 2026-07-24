export const CONSENT_TEMPLATE_EVENTS = {
  CREATE: 'consent_template.create',
  UPDATE: 'consent_template.update',
  ARCHIVE: 'consent_template.archive',
  LIST: 'consent_template.list',
  GET: 'consent_template.get',
} as const;

export type ConsentTemplateEvent =
  (typeof CONSENT_TEMPLATE_EVENTS)[keyof typeof CONSENT_TEMPLATE_EVENTS];

export const CONSENT_FORM_EVENTS = {
  SIGN: 'consent_form.sign',
  LIST: 'consent_form.list',
  GET: 'consent_form.get',
} as const;

export type ConsentFormEvent =
  (typeof CONSENT_FORM_EVENTS)[keyof typeof CONSENT_FORM_EVENTS];
