import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class VerifyOtpDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'The email of the user.',
    format: 'email',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: '123456',
    description: 'The otp to reset the password.',
  })
  @IsNotEmpty()
  otp: number;
}
