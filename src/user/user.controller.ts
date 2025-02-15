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
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';
import { AuthGuard } from '../auth/gaurds/auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ActiveUser } from 'src/auth/decorators/active-user.decorator';
import { ActiveUserData } from 'src/auth/interfaces/active-user.interface';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { GetUsersDto } from './dto/get-users.dto';

@Controller('v1/users')
@ApiTags('Users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
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
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
