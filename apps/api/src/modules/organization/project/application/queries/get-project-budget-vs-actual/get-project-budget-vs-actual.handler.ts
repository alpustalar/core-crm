import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Decimal } from 'decimal.js';
import { ProjectPhase as IProjectPhase } from '@shared';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import {
  IProjectQueryRepository,
  PROJECT_QUERY_REPOSITORY,
} from '@modules/organization/project/domain/repositories/project/project.query.repository';
import { ProjectCostTotalRow } from '@modules/organization/project/domain/contracts/project.contracts';
import { GetProjectBudgetVsActualQuery } from './get-project-budget-vs-actual.query';
import {
  CostSourceLine,
  GetProjectBudgetVsActualResponse,
  PhaseBudgetLine,
} from './get-project-budget-vs-actual.response';

/**
 * Bütçe-vs-fiili raporu. Bütçe aşımı **engellenmez, raporlanır** — gerçek
 * hayatta harcama olur, yönetim onu görmek ister; yazma anında bloklamak
 * kullanıcıyı sistemin dışına iter.
 *
 * Rapor finans yetkisi ister: proje panosunu gören herkes harcama görmemeli.
 */
@QueryHandler(GetProjectBudgetVsActualQuery)
export class GetProjectBudgetVsActualHandler implements IQueryHandler<
  GetProjectBudgetVsActualQuery,
  GetProjectBudgetVsActualResponse
> {
  constructor(
    @Inject(PROJECT_QUERY_REPOSITORY)
    private readonly projectQueryRepo: IProjectQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(
    query: GetProjectBudgetVsActualQuery
  ): Promise<GetProjectBudgetVsActualResponse> {
    const project = await this.projectQueryRepo.findByIdWithPhases(
      query.projectId
    );
    if (!project) return { data: null };

    this.policyFactory
      .project(query.ctx.actor, query.ctx.source)
      .evaluator.check((p) => p.canManageProjectFinancials(project.clinicId))
      .orThrow('project.budget-vs-actual');

    const costRows = await this.projectQueryRepo.costTotals(query.projectId);

    const actual = costRows.reduce(
      (sum, row) => sum.plus(row.total),
      new Decimal(0)
    );
    const budget = project.budget
      ? new Decimal(project.budget.toString())
      : null;

    return {
      data: {
        projectId: project.id,
        currency: project.currency,
        budget: budget ? budget.toFixed(2) : null,
        actual: actual.toFixed(2),
        variance: budget ? budget.minus(actual).toFixed(2) : null,
        utilizationPercent: this.utilization(budget, actual),
        isOverBudget: budget !== null && actual.greaterThan(budget),
        phases: this.phaseLines(project.phases, costRows),
        unassigned: this.sumFor(costRows, (r) => r.phaseId === null).toFixed(2),
        bySource: this.sourceLines(costRows),
      },
    };
  }

  private phaseLines(
    phases: IProjectPhase[],
    costRows: ProjectCostTotalRow[]
  ): PhaseBudgetLine[] {
    return phases.map((phase) => {
      const spent = this.sumFor(costRows, (r) => r.phaseId === phase.id);
      const phaseBudget = phase.budget
        ? new Decimal(phase.budget.toString())
        : null;

      return {
        phaseId: phase.id,
        phaseName: phase.name,
        budget: phaseBudget ? phaseBudget.toFixed(2) : null,
        actual: spent.toFixed(2),
        variance: phaseBudget ? phaseBudget.minus(spent).toFixed(2) : null,
      };
    });
  }

  private sourceLines(costRows: ProjectCostTotalRow[]): CostSourceLine[] {
    const buckets = new Map<string, Decimal>();
    for (const row of costRows) {
      const current = buckets.get(row.source) ?? new Decimal(0);
      buckets.set(row.source, current.plus(row.total));
    }
    return [...buckets.entries()].map(([source, amount]) => ({
      source,
      amount: amount.toFixed(2),
    }));
  }

  private sumFor(
    rows: ProjectCostTotalRow[],
    predicate: (row: ProjectCostTotalRow) => boolean
  ): Decimal {
    return rows
      .filter(predicate)
      .reduce((sum, row) => sum.plus(row.total), new Decimal(0));
  }

  /** Bütçe 0 ise yüzde tanımsızdır (sıfıra bölme) — null döner. */
  private utilization(budget: Decimal | null, actual: Decimal): number | null {
    if (!budget || budget.isZero()) return null;
    return actual.dividedBy(budget).times(100).toDecimalPlaces(1).toNumber();
  }
}
