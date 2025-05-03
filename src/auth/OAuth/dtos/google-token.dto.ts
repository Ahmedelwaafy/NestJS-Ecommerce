import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GoogleTokenDto {
  @ApiProperty({
    description: 'The Google auth token',
    example: 'a very long string',
  })
  @IsNotEmpty()
  token: string;
}
