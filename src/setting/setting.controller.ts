import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { SettingService } from './setting.service';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { AuthGuard } from 'src/auth/gaurds/auth.guard';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { PaginationAndFiltersDto } from 'src/common/dto/base-filters.dto';

@Controller('v1/setting')
export class SettingController {
  constructor(private readonly settingService: SettingService) {}

  /**
   * //***** Create a Setting ******
   */
  @Post()
  @Roles([Role.Admin])
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'setting created successfully',
  })
  @ApiOperation({
    summary: 'Creates a new setting',
    description: 'Creates a new setting',
  })
  @ApiBody({
    description: 'Setting details',
    type: CreateSettingDto,
  })
  @ResponseMessage(['CREATED_SUCCESSFULLY', 'SETTING'])
  create(@Body() createSettingDto: CreateSettingDto) {
    return this.settingService.create(createSettingDto);
  }

  /**
   * //***** Get all Settings ******
   */
  @Get()
  @Roles([Role.Admin])
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Get all settings',
  })
  @ApiResponse({
    status: 200,
    description: 'Settings fetched successfully',
  })
  @ResponseMessage(['GET_ALL_SUCCESSFULLY', 'SETTING'])
  findAll(@Query() getSettingsQuery: PaginationAndFiltersDto) {
    const { limit, page, ...filters } = getSettingsQuery;
    return this.settingService.findAll({ page, limit }, filters);
  }

  /**
   * //***** Get a Setting ******
   */
  @Get(':key')
  @Roles([Role.Admin])
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Fetches a setting by its key',
  })
  @ApiResponse({
    status: 200,
    description: 'Setting fetched successfully',
  })
  @ApiParam({
    name: 'key',
    description: 'Setting key',
    type: String,
  })
  @ResponseMessage(['GET_ONE_SUCCESSFULLY', 'SETTING'])
  findOne(@Param('key') key: string) {
    return this.settingService.findOne(key);
  }

  /**
   * //***** Update a Setting ******
   */
  @Patch(':key')
  @Roles([Role.Admin])
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Updates a setting by its key',
  })
  @ApiResponse({
    status: 200,
    description: 'Setting updated successfully',
  })
  @ApiParam({
    name: 'key',
    description: 'Setting key',
    type: String,
  })
  @ApiBody({
    description: 'Setting details',
    type: UpdateSettingDto,
  })
  @ResponseMessage(['UPDATED_SUCCESSFULLY', 'SETTING'])
  update(
    @Param('key') key: string,
    @Body() updateSettingDto: UpdateSettingDto,
  ) {
    return this.settingService.update(key, updateSettingDto);
  }

  /**
   * //***** Delete a Setting ******
   */
  @Delete(':key')
  @Roles([Role.Admin])
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Deletes a setting by its key',
  })
  @ApiResponse({
    status: 200,
    description: 'Setting deleted successfully',
  })
  @ApiParam({
    name: 'key',
    description: 'Setting key',
    type: String,
  })
  @ResponseMessage(['DELETED_SUCCESSFULLY', 'SETTING'])
  remove(@Param('key') key: string) {
    return this.settingService.remove(key);
  }
}
