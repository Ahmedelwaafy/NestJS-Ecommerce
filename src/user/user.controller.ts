import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';
import { AuthGuard } from '../auth/gaurds/auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ActiveUser } from 'src/auth/decorators/active-user.decorator';
import { ActiveUserData } from 'src/auth/interfaces/active-user.interface';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { GetUsersDto } from './dto/get-users.dto';
import { Role } from 'src/auth/enums/role.enum';

@Controller('v1/users')
@ApiTags('Users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User created successfully',
  })
  @ApiOperation({
    summary: 'Creates a new user',
    description: 'Creates a new user',
  })
  @ResponseMessage('User created successfully')
  create(
    @Body() createUserDto: CreateUserDto,
    //@ActiveUser() user: ActiveUserData,
  ) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Fetches a list of registered users on the application',
  })
  @ApiResponse({
    status: 200,
    description: 'Users fetched successfully',
  })
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  findAll(@Query() getUsersQuery: GetUsersDto) {
    const { limit, page, ...filters } = getUsersQuery;
    return this.userService.findAll({ page, limit }, filters);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Fetches a user by its id',
  })
  @ApiResponse({
    status: 200,
    description: 'User fetched successfully',
  })
  @ApiParam({
    name: 'id',
    description: 'User id',
    type: String,
  })
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Updates a user by its id',
  })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
  })
  @ApiParam({
    name: 'id',
    description: 'User id',
    type: String,
  })
  @ResponseMessage('User updated successfully')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Deletes a user by its id',
  })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully',
  })
  @ApiParam({
    name: 'id',
    description: 'User id',
    type: String,
  })
  @ResponseMessage('User deleted successfully')
  deactivate(@Param('id') id: string) {
    return this.userService.deactivate(id);
  }
}

@Controller('v1/user/profile')
@ApiTags('user Profile')
export class UserProfileController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({
    summary: 'User fetches his data',
  })
  @ApiResponse({
    status: 200,
    description: 'Data fetched successfully',
  })
  @Roles(['user']) //don't add admin because user and admin have different secrets, so there will be issue in the guard if we use ['user', 'admin']
  @UseGuards(AuthGuard)
  getMyProfile(@ActiveUser('_id') _id: ActiveUserData['_id']) {
    //console.log('user id', _id);
    return this.userService.findOne(_id);
  }

  @Patch()
  @ApiOperation({
    summary: 'User updates his data',
  })
  @ApiResponse({
    status: 200,
    description: 'Data updated successfully',
  })
  @Roles(['user'])
  @UseGuards(AuthGuard)
  updateMyProfile(
    @ActiveUser('_id') _id: ActiveUserData['_id'],
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(_id, updateUserDto);
  }

  @Delete()
  @ApiOperation({
    summary: 'User deactivates his data',
  })
  @ApiResponse({
    status: 200,
    description: 'Account deactivated successfully',
  })
  @Roles(['user'])
  @UseGuards(AuthGuard)
  @ResponseMessage('Account deactivated successfully')
  deactivateMyProfile(@ActiveUser('_id') _id: ActiveUserData['_id']) {
    return this.userService.deactivate(_id);
  }
}
