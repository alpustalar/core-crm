export interface SagaStep {
  forward: () => Promise<any>;
  compensate: () => Promise<void>;
}
