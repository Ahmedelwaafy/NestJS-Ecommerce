import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../schemas/user.schema';
import { Model } from 'mongoose';
import { GoogleUser } from '../interfaces';

@Injectable()
export class CreateGoogleUserProvider {
  constructor(
    //* injecting user model
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  public async createGoogleUser(googleUser: GoogleUser) {
    try {
      const user = this.userModel.create(googleUser);
      return user;
    } catch (error) {
      throw new ConflictException(error);
    }
  }
}
