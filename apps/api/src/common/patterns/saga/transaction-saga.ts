import { Logger } from '@nestjs/common';
import { SagaStep } from './saga-step.interface';

export class TransactionSaga {
  private readonly logger = new Logger(TransactionSaga.name);
  private steps: SagaStep[] = [];
  private executedSteps: SagaStep[] = [];

  /**
   * Add a step to the saga
   * @param forward - The action to perform
   * @param compensate - The rollback action if something fails
   */
  addStep(forward: () => Promise<any>, compensate: () => Promise<void>): void {
    this.steps.push({ forward, compensate });
  }

  /**
   * Execute all steps in order
   * If any step fails, run compensation for all executed steps
   */
  async execute(): Promise<void> {
    try {
      for (const step of this.steps) {
        this.logger.log(`Executing step ${this.executedSteps.length + 1}`);

        // Execute the forward action
        await step.forward();

        // Track executed steps for potential rollback
        this.executedSteps.push(step);
      }

      this.logger.log('All saga steps executed successfully');
    } catch (error) {
      this.logger.error('Saga execution failed', error);

      // Rollback all executed steps
      await this.compensate();

      throw error;
    }
  }

  /**
   * Compensate (rollback) all executed steps in reverse order
   */
  async compensate(): Promise<void> {
    this.logger.warn(
      `Compensating ${this.executedSteps.length} executed steps`
    );

    // Reverse order for compensation
    const stepsToCompensate = [...this.executedSteps].reverse();

    for (const [index, step] of stepsToCompensate.entries()) {
      try {
        this.logger.log(`Compensating step ${index + 1}`);
        await step.compensate();
      } catch (compensationError) {
        // ⚠️ Compensation failed - critical error!
        this.logger.error(
          `Compensation failed for step ${index + 1}`,
          compensationError
        );
        // Continue compensating other steps
      }
    }

    this.logger.warn('Compensation completed');
  }

  /**
   * Get the number of executed steps
   */
  getExecutedStepsCount(): number {
    return this.executedSteps.length;
  }

  /**
   * Reset the saga (clear all steps)
   */
  reset(): void {
    this.steps = [];
    this.executedSteps = [];
  }
}
