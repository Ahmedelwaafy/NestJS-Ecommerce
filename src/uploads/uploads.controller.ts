import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse
} from '@nestjs/swagger';
import { ACCESS_TOKEN_COOKIE_NAME } from 'src/auth/constants/auth.constants';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { UploadsService } from './uploads.service';

@Controller('v1/uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  /**
   * //***** Upload single file ********
   */
  @Post('single')
  @Roles([Role.User])
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'File uploaded successfully',
  })
  @ApiOperation({ summary: 'Upload a file', description: 'Upload a file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['image'],
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: 'Image to upload (JPG, PNG, GIF, WEBP only)',
        },
      },
    },
  })
  @ApiBearerAuth(ACCESS_TOKEN_COOKIE_NAME)
  @ResponseMessage(['FILE_UPLOADED_SUCCESSFULLY'])
  public uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.uploadsService.uploadFileToCloudinary(file);
  }

  /**
   * //***** Upload multiple files ********
   */
  @Post('multiple')
  @Roles([Role.User])
  @UseGuards(AuthGuard)
  @UseInterceptors(FilesInterceptor('images', 3)) // Maximum 3 files
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Files uploaded successfully',
  })
  @ApiOperation({
    summary: 'Upload multiple files',
    description: 'Upload multiple image files at once',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['images'],
      properties: {
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Images to upload (JPG, PNG, GIF, WEBP only)',
        },
      },
    },
  })
  @ApiBearerAuth(ACCESS_TOKEN_COOKIE_NAME)
  @ResponseMessage(['FILES_UPLOADED_SUCCESSFULLY'])
  public uploadMultipleFiles(@UploadedFiles() files: Express.Multer.File[]) {
    return this.uploadsService.uploadFilesToCloudinary(files);
  }
}
