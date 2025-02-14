import { User } from './schemas/user.schema';
import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ActiveUserData } from 'src/auth/interfaces/active-user.interface';

@Injectable()
export class UserService {
  constructor(
    //* injecting user model
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}
  create(createUserDto: CreateUserDto, user: ActiveUserData) {
    console.log({ user });
    return this.userModel.create(createUserDto);
  }

  findAll() {
    return this.userModel.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
