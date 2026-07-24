export const PIPELINE_EVENTS = {
  CREATED: 'pipeline.created',
} as const;

export type PipelineEvent =
  (typeof PIPELINE_EVENTS)[keyof typeof PIPELINE_EVENTS];
