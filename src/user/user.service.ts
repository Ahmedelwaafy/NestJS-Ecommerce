import {
  forwardRef,
  Inject,
  Injectable,
  RequestTimeoutException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HashingProvider } from 'src/auth/providers/hashing.provider';
import { PaginationQueryDto } from 'src/common/pagination/dto/pagination-query.dto';
import { Paginated } from 'src/common/pagination/interfaces/paginated.interface';
import { PaginationService } from 'src/common/pagination/providers/pagination.service';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUsersBaseDto } from './dto/get-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserProvider } from './providers/create-user.provider';
import { FindUserByEmailProvider } from './providers/find-user-by-email.provider';
import { FindUserByGoogleIdProvider } from './providers/find-user-by-google-id.provider';
import { User } from './schemas/user.schema';
import { ExcludedFields, ExcludedUserFields } from './utils';
import { FindUserByIdProvider } from './providers/find-user-by-id.provider';
import { CreateGoogleUserProvider } from './providers/create-google-user.provider';
import { GoogleUser } from './interfaces';

/**
 * UserService
 */
@Injectable()
export class UserService {
  constructor(
    //* injecting user model
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly createUserProvider: CreateUserProvider,
    private readonly findUserByIdProvider: FindUserByIdProvider,
    private readonly findUserByGoogleIdProvider: FindUserByGoogleIdProvider,
    private readonly findUserByEmailProvider: FindUserByEmailProvider,
    private readonly createGoogleUserProvider: CreateGoogleUserProvider,
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
    return await this.findUserByIdProvider.findById(id);
  }
  public async findOneByEmail(
    email: string,
    includedFields?: ExcludedFields[],
  ) {
    return this.findUserByEmailProvider.findOneByEmail(email, includedFields);
  }
  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    includedFields?: ExcludedFields[],
  ) {
    //check if user exits, and if not throw error
    await this.findUserByIdProvider.findById(id);

    if (updateUserDto.password) {
      updateUserDto.password = await this.hashingProvider.hashPassword(
        updateUserDto.password,
      );
    }
    try {
      const updatedUser = await this.userModel
        .findByIdAndUpdate(id, updateUserDto, { new: true })
        .select(ExcludedUserFields(includedFields));
      return updatedUser;
    } catch {
      throw new RequestTimeoutException('an error occurred', {
        description: 'unable to connect to the database',
      });
    }
  }

  async deactivate(id: string) {
    await this.findUserByIdProvider.findById(id);
    try {
      return await this.userModel
        .findByIdAndUpdate(id, { active: false }, { new: true })
        .select(ExcludedUserFields());
    } catch {
      throw new RequestTimeoutException('an error occurred', {
        description: 'unable to connect to the database',
      });
    }
  }

  public async findOneByGoogleId(googleId: string) {
    return this.findUserByGoogleIdProvider.findById(googleId);
  }

  public async createGoogleUser(googleUser: GoogleUser) {
    return this.createGoogleUserProvider.createGoogleUser(googleUser);
  }
}
