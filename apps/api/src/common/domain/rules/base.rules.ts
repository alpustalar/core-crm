import { Validate } from '@common/interfaces';
import { shouldValidate } from '@common/domain/utils/should-validate';
import { DefaultValidateOptions } from '@common/domain/constants/default-options.constant';

export abstract class BaseRules {
  protected evaluate(
    isValid: boolean,
    exceptionFactory: () => Error,
    validateOptions = DefaultValidateOptions
  ): Validate {
    const isBypass = !shouldValidate(validateOptions);
    const finalIsValid = isBypass ? true : isValid;
    return {
      isValid: finalIsValid,
      orThrow: () => {
        if (!finalIsValid) throw exceptionFactory();
      },
    };
  }
}
