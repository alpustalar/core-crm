export const DefaultValidateOptions: ValidateOptionsType = {
  businessRulesEnabled: true,
  systemOverride: false,
};

export type ValidateOptionsType = {
  businessRulesEnabled?: boolean;
  systemOverride?: boolean;
};
