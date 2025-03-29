import { PickType } from '@nestjs/swagger';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

/**
 * DTO for creating a user
 */
//* don't add the role and forbidNonWhitelisted, to prevent sending the role from the body
export class SignUpDto extends PickType(CreateUserDto, [
  'name',
  'email',
  'password',
  'age',
  'gender',
] as const) {}
