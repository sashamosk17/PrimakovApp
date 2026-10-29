export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

export const validateEnvironment = (): void => {
  const errors: string[] = [];

  // Validate JWT_SECRET
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    errors.push('JWT_SECRET is required but not set');
  } else if (jwtSecret === 'dev_secret' || jwtSecret === 'your_jwt_secret_key_change_in_production') {
    errors.push('JWT_SECRET must be changed from default value in production');
  } else if (jwtSecret.length < 32) {
    errors.push('JWT_SECRET must be at least 32 characters long');
  }

  // Validate database configuration
  if (!process.env.DB_HOST) {
    errors.push('DB_HOST is required');
  }
  if (!process.env.DB_NAME) {
    errors.push('DB_NAME is required');
  }
  if (!process.env.DB_USER) {
    errors.push('DB_USER is required');
  }
  if (!process.env.DB_PASSWORD) {
    errors.push('DB_PASSWORD is required');
  }

  // In production, validate ALLOWED_ORIGINS
  if (process.env.NODE_ENV === 'production' && !process.env.ALLOWED_ORIGINS) {
    errors.push('ALLOWED_ORIGINS is required in production');
  }

  if (errors.length > 0) {
    throw new ConfigurationError(
      `Environment validation failed:\n${errors.map(e => `  - ${e}`).join('\n')}`
    );
  }

  console.log('✓ Environment configuration validated');
};
