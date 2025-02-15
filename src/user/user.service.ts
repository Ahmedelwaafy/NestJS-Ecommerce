import { User } from './schemas/user.schema';
import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  RequestTimeoutException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserProvider } from './providers/create-user.provider';
import { PaginationService } from 'src/common/pagination/providers/pagination.service';
import { PaginationQueryDto } from 'src/common/pagination/dto/pagination-query.dto';
import { Paginated } from 'src/common/pagination/interfaces/paginated.interface';
import { GetUsersBaseDto, GetUsersDto } from './dto/get-users.dto';
import { FindUserByIdProvider } from './providers/find-user-by-id.provider';
import { HashingProvider } from 'src/auth/providers/hashing.provider';

@Injectable()
export class UserService {
  constructor(
    //* injecting user model
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly createUserProvider: CreateUserProvider,
    private readonly findUserByIdProvider: FindUserByIdProvider,
    private readonly paginationService: PaginationService,
    @Inject(forwardRef(() => HashingProvider))
    private readonly hashingProvider: HashingProvider,
  ) {}

  create(createUserDto: CreateUserDto) {
    return this.createUserProvider.createUser(createUserDto);
  }

  // Example with different filter scenarios
  async findAll(
    paginationQuery: PaginationQueryDto,
    getUsersQuery?: GetUsersBaseDto,
  ): Promise<Paginated<User>> {
    const filters: Record<string, any> = {};
    //console.log({ getUsersQuery }); // if not passed any => { getUsersQuery: {} }
    // Build filters dynamically
    if (getUsersQuery?.role) {
      filters.role = getUsersQuery.role;
    }

    if (getUsersQuery?.active !== undefined) {
      filters.active = getUsersQuery.active;
    }

    if (getUsersQuery?.age) {
      filters.age = getUsersQuery.age;
    }

    if (getUsersQuery?.search) {
      filters.$or = [
        { name: { $regex: getUsersQuery.search, $options: 'i' } },
        { email: { $regex: getUsersQuery.search, $options: 'i' } },
      ];
    }

    return this.paginationService.paginateQuery(
      paginationQuery,
      this.userModel,
      {
        filters,
        select: '-password -__v',
        ...(getUsersQuery?.sort && { sort: getUsersQuery.sort }),
      },
    );
  }

  async findOne(id: string) {
    const user = await this.findUserByIdProvider.findById(id);
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.findUserByIdProvider.findById(id);
    if (updateUserDto.password) {
      updateUserDto.password = await this.hashingProvider.hashPassword(
        updateUserDto.password,
      );
    }
    try {
      const updatedUser = await this.userModel
        .findByIdAndUpdate(id, updateUserDto, { new: true })
        .select('-password -__v');
      return updatedUser;
    } catch {
      throw new RequestTimeoutException('an error occurred', {
        description: 'unable to connect to the database',
      });
    }
  }

  async remove(id: string) {
    await this.findUserByIdProvider.findById(id);
    try {
      await this.userModel.findByIdAndUpdate(id, { active: false });
    } catch {
      throw new RequestTimeoutException('an error occurred', {
        description: 'unable to connect to the database',
      });
    }
  }
}
