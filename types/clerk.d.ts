declare global {
  interface CustomJwtSessionClaims {
    // Clerk's standard publicMetadata path
    publicMetadata?: {
      onboarding3Completed?: boolean;
      onboarding2Completed?: boolean;
      onboarding1Completed?: boolean;
    };
    // Custom metadata path (if custom type mapping is used)
    metadata?: {
      onboarding3Completed?: boolean;
      onboarding2Completed?: boolean;
      onboarding1Completed?: boolean;
    };
  }
}

export {};
