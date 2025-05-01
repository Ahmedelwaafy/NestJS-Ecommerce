import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { fileTypes } from './enums/file-types.enum';
import { IUploadedFile } from './interfaces/upload-file.interface';
import { AwsS3Provider } from './providers/aws/aws-s3.provider';
import { CloudinaryProvider } from './providers/cloudinary/cloudinary.provider';
import { generateFileName } from './utils';
import { FileValidationUtil } from './providers/file-validation.utility';

@Injectable()
export class UploadsService {
  constructor(
    private readonly awsS3Provider: AwsS3Provider,
    private readonly cloudinaryProvider: CloudinaryProvider,
    private readonly configService: ConfigService,
  ) {}

  public async uploadFileToAwsS3(file: Express.Multer.File) {
    console.log(file.mimetype);
    //validateFile
    FileValidationUtil.validateFile(file);
    //upload the file to aws s3 bucket
    const name = await this.awsS3Provider.uploadFile(file);
    //generate a new entry in the database
    const uploadedFile: IUploadedFile = {
      name,
      path: `https://${this.configService.get('appConfig.awsCloudfrontUrl')}/${name}`,
      type: fileTypes.IMAGE,
      mime: file.mimetype,
      size: file.size,
    };
    return uploadedFile;
  }

  public async uploadFileToCloudinary(file: Express.Multer.File) {
    console.log(file.mimetype);
    //validateFile
    FileValidationUtil.validateFile(file);

    const { secure_url, resource_type } =
      await this.cloudinaryProvider.uploadFile(file);

    const uploadedFile: IUploadedFile = {
      name: generateFileName(file),
      path: secure_url,
      type: resource_type,
      mime: file.mimetype,
      size: file.size,
    };
    return uploadedFile;
  }
  public async uploadFilesToCloudinary(files: Express.Multer.File[]) {
    //validateFiles

    FileValidationUtil.validateFiles(files);

    const uploadedFiles = await this.cloudinaryProvider.uploadFiles(files);

    const result = uploadedFiles.map((file, i) => ({
      name: generateFileName(files[i]),
      path: file.secure_url,
      type: file.resource_type,
      mime: files[i].mimetype,
      size: files[i].size,
    }));
    //console.log({ files, result });

    return result;
  }
}
