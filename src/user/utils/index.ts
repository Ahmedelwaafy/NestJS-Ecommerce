export function ExcludedUserFields(includedFields: string[] = []): string {
  // Base excluded fields (everything is excluded by default)
  const excludedFields = new Set([
    '-password',
    '-__v',
    '-PasswordVerificationCode',
    '-passwordVerificationCodeExpiresAt',
    '-passwordResetToken',
    '-passwordChangedAt',
    '-createdAt',
    '-updatedAt',
    '-active',
  ]);

  // Remove included fields from the exclusion list
  includedFields.forEach((field) => excludedFields.delete(`-${field}`));

  return Array.from(excludedFields).join(' ');
}
