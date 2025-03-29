import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Match } from 'src/common/decorators/match.decorator';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'The email of the user.',
  })
  @IsNotEmpty({ message: 'email is required.' })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'The password of the user.',
    minLength: 6,
    maxLength: 20,
  })
  @IsNotEmpty({ message: 'Password is required.' })
  @IsString()
  @MinLength(6, {
    message: 'Password must be at least 6 characters long.',
  })
  @MaxLength(20, {
    message: 'Password must be at most 20 characters long.',
  })
  password: string;

  @ApiProperty({
    example: 'password123',
    description: 'Confirm the password.',
  })
  @IsNotEmpty({ message: 'confirmPassword is required.' })
  @IsString()
  @Match('password', { message: 'Passwords do not match' })
  confirmPassword: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Reset token received after OTP verification',
  })
  @IsString()
  resetToken: string;
}
