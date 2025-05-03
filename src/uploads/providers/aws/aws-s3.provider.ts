import { Injectable, RequestTimeoutException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3 } from 'aws-sdk';
import { I18nHelperService } from 'src/i18n/providers/I18n-helper-service';
import { TFunction } from 'src/i18n/types';
import { generateFileName } from 'src/uploads/utils';

@Injectable()
export class AwsS3Provider {
  private t: TFunction;

  constructor(
    private readonly configService: ConfigService,
    private readonly i18nHelper: I18nHelperService,
  ) {
    //this.t = this.i18nHelper.translate().t;
  }
  //***** Uploads a file to aws s3 ******

  public async uploadFile(file: Express.Multer.File) {
    //upload the file to aws s3 bucket
    const s3 = new S3();

    try {
      const uploadResult = await s3
        .upload({
          Bucket: this.configService.get('appConfig.awsBucketName'),
          Body: file.buffer,
          Key: generateFileName(file),
          ContentType: file.mimetype,
        })
        .promise();

      return uploadResult.Key;
    } catch (error) {
      throw new RequestTimeoutException(error);
    }
  }
}
