import {
  Injectable,
  NotFoundException,
  RequestTimeoutException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class FindUserByEmailProvider {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async findOneByEmail(email: string, includePassword = false) {
    let user: UserDocument;
    try {
      const query = this.userModel.findOne({ email });

      // Only exclude password when not needed
      if (!includePassword) {
        query.select('-password -__v');
      }

      user = await query;
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
