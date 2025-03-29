import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { Match } from 'src/common/decorators/match.decorator';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Reset token received after OTP verification',
  })
  @IsString()
  resetToken: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'The email of the user.',
  })
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
    example: 'password123',
    description: 'Confirm the password.',
  })
  @IsString()
  @Match('password', { message: 'Passwords do not match' })
  confirmPassword: string;
}
