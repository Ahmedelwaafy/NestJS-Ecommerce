import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUrl,
  Length,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Gender } from '../enums/gender.enum';
import { Role } from '../../auth/enums/role.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'The name of the user.',
    minLength: 3,
    maxLength: 30,
  })
  @IsString()
  @MinLength(3, {
    message: 'Name must be at least 3 characters long.',
  })
  @MaxLength(30, {
    message: 'Name must be at most 30 characters long.',
  })
  name: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'The email of the user.',
    format: 'email',
  })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'The password of the user.',
    minLength: 6,
    maxLength: 20,
  })
  @IsString()
  @MinLength(6, {
    message: 'Password must be at least 6 characters long.',
  })
  @MaxLength(20, {
    message: 'Password must be at most 20 characters long.',
  })
  password: string;

  @ApiProperty({
    example: Role.User,
    description: 'The role of the user.',
    enum: Role,
  })
  @IsOptional()
  @IsEnum(Role)
  role: Role;

  @ApiPropertyOptional({
    example: 'https://example.com/avatar.jpg',
    description: 'The avatar of the user.',
    format: 'url',
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  avatar?: string;

  @ApiPropertyOptional({
    example: 25,
    description: 'The age of the user.',
    minimum: 18,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(18, {
    message: 'Age must be at least 18.',
  })
  @Max(100, {
    message: 'Age must be at most 100.',
  })
  age?: number;

  @ApiPropertyOptional({
    example: '+1234567890',
    description: 'The phone number of the user.',
    pattern: `/^\+?[1-9]\d{1,14}$/`,
  })
  @IsOptional()
  @IsString()
  @IsPhoneNumber('EG', {
    message: 'validation.INVALID_EGYPTIAN_PHONE_NUMBER',
  })
  phoneNumber?: string;

  @ApiPropertyOptional({
    example: '123 Main St',
    description: 'The address of the user.',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'The active status of the user.',
    enum: [true, false],
  })
  @IsOptional()
  @IsBoolean({
    message: 'Active status must be true or false.',
  })
  active?: boolean;

  @ApiPropertyOptional({
    example: '123456',
    description: 'The verification code of password resetting for the user.',
    type: 'number',
  })
  @IsOptional()
  @IsNumber()
  PasswordVerificationCode?: number;

  @ApiPropertyOptional({
    example: '2023-01-01T00:00:00.000Z',
    description: 'The date and time when the password reset token expires.',
    type: 'string',
    format: 'date-time',
  })
  @IsOptional()
  @IsString()
  passwordVerificationCodeExpiresAt?: Date;

  @ApiPropertyOptional({
    description: 'The token of password resetting for the user.',
    type: 'string',
  })
  @IsOptional()
  @IsString()
  passwordResetToken?: string;

  @ApiPropertyOptional({
    example: '2023-01-01T00:00:00.000Z',
    description: 'The date and time when the password was last changed.',
    type: 'string',
    format: 'date-time',
  })
  @IsOptional()
  @IsString()
  passwordChangedAt?: Date;

  @ApiPropertyOptional({
    example: Gender.Male,
    description: 'The gender of the user.',
    enum: Gender,
  })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;
}
