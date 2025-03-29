import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgetPasswordDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'The email of the user.',
    format: 'email',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
