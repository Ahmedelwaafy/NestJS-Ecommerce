import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  RequestTimeoutException,
} from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../schemas/user.schema';
import { Model } from 'mongoose';
import { HashingProvider } from 'src/auth/providers/hashing.provider';

@Injectable()
export class CreateUserProvider {
  constructor(
    //* injecting user model
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @Inject(forwardRef(() => HashingProvider))
    private readonly hashingProvider: HashingProvider,
  ) {}

  public async createUser(createUserDto: CreateUserDto) {
    let existingUser = undefined;
    // check if user already exists
    try {
      existingUser = await this.userModel.findOne({
        email: createUserDto.email,
      });
    } catch {
      throw new RequestTimeoutException('an error occurred', {
        description: 'unable to connect to the database',
      });
    }

    // handle exception if user already exists
    if (existingUser) {
      throw new BadRequestException('email already exists');
    }

    try {
      // create new user
      const newUser = await this.userModel.create({
        ...createUserDto,
        password: await this.hashingProvider.hashPassword(
          createUserDto.password,
        ),
      });
      const { password, ...userWithoutPassword } = newUser.toObject();
      return userWithoutPassword;
    } catch {
      throw new RequestTimeoutException('an error occurred', {
        description: 'unable to connect to the database',
      });
    }
  }
}
