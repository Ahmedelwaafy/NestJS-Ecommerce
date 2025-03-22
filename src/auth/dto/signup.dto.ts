import { PickType } from '@nestjs/swagger';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

/**
 * DTO for creating a user
 */
export class SignUpDto extends PickType(CreateUserDto, [
  'name',
  'email',
  'password',
  'age',
  'gender',
] as const) {}
