import { User } from '../schemas/user.schema';

export type ExcludedFields =
  | 'password'
  | '__v'
  | 'PasswordVerificationCode'
  | 'passwordVerificationCodeExpiresAt'
  | 'passwordResetToken'
  | 'passwordChangedAt'
  | 'createdAt'
  | 'updatedAt'
  | 'active';
export function ExcludedUserFields(
  includedFields: ExcludedFields[] = [],
): string {
  // Base excluded fields (default exclusions)
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
