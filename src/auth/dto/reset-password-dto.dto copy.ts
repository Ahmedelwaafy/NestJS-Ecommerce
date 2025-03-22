import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'The email of the user.',
    format: 'email',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
