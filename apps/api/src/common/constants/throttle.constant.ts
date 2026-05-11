/**
 * Throttle configurations for rate limiting
 */
export const THROTTLE_CONFIG = {
  /**
   * For sensitive operations like password reset, email verification
   * 3 requests per minute to prevent brute force and spam
   */
  SENSITIVE_ENDPOINT: { default: { limit: 3, ttl: 60 * 1000 } },

  /**
   * For email enumeration prevention (check-email, etc.)
   * 5 requests per minute - slightly more lenient than password operations
   */
  EMAIL_CHECK: { default: { limit: 5, ttl: 60 * 1000 } },

  /**
   * For authentication endpoints (login, etc.)
   * 5 requests per minute to prevent credential stuffing
   */
  AUTH_ENDPOINT: { default: { limit: 5, ttl: 60 * 1000 } },
};
