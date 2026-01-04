export function validateEnv(params: string[]) {
    if (!params || params.length === 0) {
      throw new Error('No environment variables provided for validation.');
    }
    if (!Array.isArray(params)) {
      throw new Error('Environment variables should be provided as an array.');
    }
    if (params.some((key) => typeof key !== 'string')) {
      throw new Error('All environment variable keys should be strings.');
    }
    if (params.some((key) => key.trim() === '')) {
      throw new Error('Environment variable keys should not be empty strings.');
    }
    if (params.some((key) => key.includes(' '))) {
      throw new Error('Environment variable keys should not contain spaces.');
    }
  
    const requiredEnvVars = params;
  
    if (typeof window !== 'undefined') return; // Skip validation on the client
  
    const missing = requiredEnvVars.filter((key) => !process.env[key]);
  
    if (missing.length > 0) {
      console.error(`❌ Missing environment variables: ${missing.join(', ')}`);
      throw new Error('Environment validation failed.');
    }
  }