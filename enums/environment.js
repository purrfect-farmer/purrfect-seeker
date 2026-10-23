/** Runtime environments, matching the NODE_ENV values */
export const Environment = Object.freeze({
  DEVELOPMENT: "development",
  TEST: "test",
  PRODUCTION: "production",
});

/** Current runtime environment */
export const currentEnvironment = () =>
  process.env.NODE_ENV || Environment.DEVELOPMENT;
