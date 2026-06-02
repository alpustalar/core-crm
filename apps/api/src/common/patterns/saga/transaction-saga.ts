import { Logger } from '@nestjs/common';
import { SagaStep } from './saga-step.interface';

export class TransactionSaga {
  private readonly logger = new Logger(TransactionSaga.name);
  private steps: SagaStep[] = [];
  private executedSteps: SagaStep[] = [];

  addStep(forward: () => Promise<any>, compensate: () => Promise<void>): void {
    this.steps.push({ forward, compensate });
  }

  async execute(): Promise<void> {
    try {
      for (const step of this.steps) {
        this.logger.log(`Executing step ${this.executedSteps.length + 1}`);

        await step.forward();

        this.executedSteps.push(step);
      }

      this.logger.log('saga successfully');
    } catch (error) {
      this.logger.error('Saga fail', error);

      await this.compensate();

      throw error;
    }
  }

  async compensate(): Promise<void> {
    this.logger.warn(`stedp ${this.executedSteps.length}`);

    // Reverse order for compensation
    const stepsToCompensate = [...this.executedSteps].reverse();

    for (const [index, step] of stepsToCompensate.entries()) {
      try {
        await step.compensate();
      } catch (compensationError) {
        this.logger.error(
          `Compensation failed - step ${index + 1}`,
          compensationError
        );
      }
    }

    this.logger.warn('Compensation completed');
  }
  getExecutedStepsCount(): number {
    return this.executedSteps.length;
  }

  reset(): void {
    this.steps = [];
    this.executedSteps = [];
  }
}
