import {
  Injectable,
  NotFoundException,
  RequestTimeoutException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';

@Injectable()
export class FindUserByIdProvider {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async findById(id: string) {
    let user: User;
    try {
      user = await this.userModel.findById(id).select('-password -__v');
    } catch (error) {
      throw new RequestTimeoutException('an error occurred', {
        description: error.message || 'unable to connect to the database',
      });
    }
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
