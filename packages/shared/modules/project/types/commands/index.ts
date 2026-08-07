import { z } from 'zod';
import {
  AllocateProjectResourceSchema,
  AssignProjectTaskSchema,
  ChangeProjectStatusSchema,
  CreateProjectPhaseSchema,
  CreateProjectSchema,
  CreateProjectTaskSchema,
  MoveProjectTaskSchema,
  RecordProjectCostSchema,
  UpdateProjectPhaseSchema,
  UpdateProjectSchema,
  UpdateProjectTaskSchema,
} from '../../schemas/commands';

export type CreateProject = z.infer<typeof CreateProjectSchema>;
export type UpdateProject = z.infer<typeof UpdateProjectSchema>;
export type ChangeProjectStatus = z.infer<typeof ChangeProjectStatusSchema>;
export type CreateProjectPhase = z.infer<typeof CreateProjectPhaseSchema>;
export type UpdateProjectPhase = z.infer<typeof UpdateProjectPhaseSchema>;
export type CreateProjectTask = z.infer<typeof CreateProjectTaskSchema>;
export type UpdateProjectTask = z.infer<typeof UpdateProjectTaskSchema>;
export type MoveProjectTask = z.infer<typeof MoveProjectTaskSchema>;
export type AssignProjectTask = z.infer<typeof AssignProjectTaskSchema>;
export type RecordProjectCost = z.infer<typeof RecordProjectCostSchema>;
export type AllocateProjectResource = z.infer<
  typeof AllocateProjectResourceSchema
>;
