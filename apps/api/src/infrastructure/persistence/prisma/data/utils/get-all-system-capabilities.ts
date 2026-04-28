import { CAPABILITIES } from '../capabilities';

export const getAllSystemCapabilities = () => {
  return Object.values(CAPABILITIES).flatMap((model) => Object.values(model));
};
