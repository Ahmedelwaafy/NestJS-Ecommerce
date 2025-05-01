import { Global, Module } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { CloudinaryProvider } from './providers/cloudinary/cloudinary.provider';
import { CloudinaryConfig } from './providers/cloudinary/cloudinary.config';
import { AwsS3Provider } from './providers/aws/aws-s3.provider';
import { UploadsController } from './uploads.controller';

@Global()
@Module({
  controllers: [UploadsController],
  providers: [
    UploadsService,
    AwsS3Provider,
    CloudinaryProvider,
    CloudinaryConfig,
  ],
  exports: [UploadsService],
})
export class UploadsModule {}
