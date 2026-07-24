export const EMPLOYEE_EVENTS = {
  ADD_CONTRACT: 'employee.add_contract',
  CREATE: 'employee.create',
  TERMINATE: 'employee.terminate',
  UPDATE: 'employee.update',
  DETAIL: 'employee.detail',
  LIST: 'employee.list',
} as const;

export type EmployeeEvent =
  (typeof EMPLOYEE_EVENTS)[keyof typeof EMPLOYEE_EVENTS];
