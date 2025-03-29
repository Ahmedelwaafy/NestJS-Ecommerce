import {
  Injectable,
  NotFoundException,
  RequestTimeoutException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { ExcludedUserFields, ExcludedFields } from '../utils';

@Injectable()
export class FindUserByEmailProvider {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async findOneByEmail(email: string, includedFields: ExcludedFields[] = []) {
    let user: UserDocument;
    try {
      user = await this.userModel
        .findOne({ email })
        .select(ExcludedUserFields(includedFields));
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
