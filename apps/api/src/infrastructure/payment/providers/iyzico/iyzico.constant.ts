export const IyzicoSdkStatus = {
  SUCCESS: 'success',
  FAILURE: 'failure',
} as const;

export type IyzicoSdkStatusType =
  (typeof IyzicoSdkStatus)[keyof typeof IyzicoSdkStatus];
