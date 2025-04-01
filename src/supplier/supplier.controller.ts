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
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { AuthGuard } from 'src/auth/gaurds/auth.guard';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { PaginationAndFiltersDto } from 'src/common/dto/base-filters.dto';
import { SupplierService } from './supplier.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Controller('v1/supplier')
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  /**
   * //***** Create a Supplier ******
   */
  @Post()
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'supplier created successfully',
  })
  @ApiOperation({
    summary: 'Creates a new supplier',
    description: 'Creates a new supplier',
  })
  @ApiBody({
    description: 'Supplier details',
    type: CreateSupplierDto,
  })
  @ResponseMessage('supplier.controller.CREATED_SUCCESSFULLY')
  create(@Body() createSupplierDto: CreateSupplierDto) {
    return this.supplierService.create(createSupplierDto);
  }

  /**
   * //***** Get all Supplier ******
   */
  @Get()
  @ApiOperation({
    summary: 'Get all suppliers',
  })
  @ApiResponse({
    status: 200,
    description: 'Suppliers fetched successfully',
  })
  @ResponseMessage('supplier.controller.GET_ALL_SUCCESSFULLY')
  findAll(@Query() getSuppliersQuery: PaginationAndFiltersDto) {
    const { limit, page, ...filters } = getSuppliersQuery;

    return this.supplierService.findAll({ page, limit }, filters);
  }

  /**
   * //***** Get a Supplier ******
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Fetches a supplier by its id',
  })
  @ApiResponse({
    status: 200,
    description: 'Supplier fetched successfully',
  })
  @ApiParam({
    name: 'id',
    description: 'Supplier id',
    type: String,
  })
  @ResponseMessage('supplier.controller.GET_ONE_SUCCESSFULLY')
  findOne(@Param('id') id: string) {
    return this.supplierService.findOne(id);
  }

  /**
   * //***** Update a Supplier ******
   */
  @Patch(':id')
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Updates a supplier by its id',
  })
  @ApiResponse({
    status: 200,
    description: 'Supplier updated successfully',
  })
  @ApiParam({
    name: 'id',
    description: 'Supplier id',
    type: String,
  })
  @ApiBody({
    description: 'Supplier details',
    type: UpdateSupplierDto,
  })
  @ResponseMessage('supplier.controller.UPDATED_SUCCESSFULLY')
  update(
    @Param('id') id: string,
    @Body() updateSupplierDto: UpdateSupplierDto,
  ) {
    return this.supplierService.update(id, updateSupplierDto);
  }

  /**
   * //***** Delete a Supplier ******
   */
  @Delete(':id')
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Deletes a supplier by its id',
  })
  @ApiResponse({
    status: 200,
    description: 'Supplier deleted successfully',
  })
  @ApiParam({
    name: 'id',
    description: 'Supplier id',
    type: String,
  })
  @ResponseMessage('supplier.controller.DELETED_SUCCESSFULLY')
  deactivate(@Param('id') id: string) {
    return this.supplierService.deactivate(id);
  }

  /**
   * //***** Restore a Supplier ******
   */
  @Patch('restore/:id')
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Restores a supplier by its id',
  })
  @ApiResponse({
    status: 200,
    description: 'Supplier restored successfully',
  })
  @ApiParam({
    name: 'id',
    description: 'Supplier id',
    type: String,
  })
  @ResponseMessage('supplier.controller.RESTORED_SUCCESSFULLY')
  activate(@Param('id') id: string) {
    return this.supplierService.activate(id);
  }
}
