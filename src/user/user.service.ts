import { User } from './schemas/user.schema';
import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserProvider } from './providers/create-user.provider';
import { PaginationService } from 'src/common/pagination/providers/pagination.service';
import { PaginationQueryDto } from 'src/common/pagination/dto/pagination-query.dto';
import { Paginated } from 'src/common/pagination/interfaces/paginated.interface';
import { GetUsersFiltersDto } from './dto/get-users.dto';

@Injectable()
export class UserService {
  constructor(
    //* injecting user model
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly createUserProvider: CreateUserProvider,
    private readonly paginationService: PaginationService,
  ) {}

  create(createUserDto: CreateUserDto) {
    return this.createUserProvider.createUser(createUserDto);
  }

  // Example with different filter scenarios
  async findAll(
    paginationQuery: PaginationQueryDto,
    getUsersFiltersQuery?: GetUsersFiltersDto,
  ): Promise<Paginated<User>> {
    const filters: Record<string, any> = {};
    //console.log({ getUsersFiltersQuery }); // if not passed any => { getUsersFiltersQuery: {} }
    // Build filters dynamically
    if (getUsersFiltersQuery?.role) {
      filters.role = getUsersFiltersQuery.role;
    }

    if (getUsersFiltersQuery?.active !== undefined) {
      filters.active = getUsersFiltersQuery.active;
    }

    if (getUsersFiltersQuery?.age) {
      filters.age = getUsersFiltersQuery.age;
    }

    if (getUsersFiltersQuery?.search) {
      filters.$or = [
        { name: { $regex: getUsersFiltersQuery.search, $options: 'i' } },
        { email: { $regex: getUsersFiltersQuery.search, $options: 'i' } },
      ];
    }

    return this.paginationService.paginateQuery(
      paginationQuery,
      this.userModel,
      {
        filters,
        select: '-password -__v',
      },
    );
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
