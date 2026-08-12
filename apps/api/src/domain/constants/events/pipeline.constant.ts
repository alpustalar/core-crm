export const PIPELINE_EVENTS = {
  CREATED: 'pipeline.created',
  LIST: 'pipeline.list',
  DETAIL: 'pipeline.detail',
} as const;

export type PipelineEvent =
  (typeof PIPELINE_EVENTS)[keyof typeof PIPELINE_EVENTS];
