import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignInDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'The email of the user.',
    format: 'email',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'password123#',
    description: 'The password of the user.',
    format: 'password',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}

