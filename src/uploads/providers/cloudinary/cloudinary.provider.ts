import {
  BadRequestException,
  Injectable,
  RequestTimeoutException,
} from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryResponse } from '../../interfaces/cloudinary-response';
import * as streamifier from 'streamifier';
import { TFunction } from 'src/i18n/types';
import { I18nHelperService } from 'src/i18n/providers/I18n-helper-service';

@Injectable()
export class CloudinaryProvider {
  private t: TFunction;

  constructor(private readonly i18nHelper: I18nHelperService) {
    //this.t = this.i18nHelper.translate().t;
  }

  uploadFile(file: Express.Multer.File): Promise<CloudinaryResponse> {
    try {
      return new Promise<CloudinaryResponse>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          },
        );

        streamifier.createReadStream(file.buffer).pipe(uploadStream);
      });
    } catch (error) {
      //throw new BadRequestException(this.t('service.FILE.UPLOAD_FAILED'));
      throw new BadRequestException('File upload failed', {
        description: error,
      });
    }
  }

  async uploadFiles(files: any[]): Promise<CloudinaryResponse[]> {
    try {
      return Promise.all(files.map((file) => this.uploadFile(file)));
    } catch (error) {
      throw new RequestTimeoutException(error);
    }
  }
  
  /**
   * Deletes a file from Cloudinary
   * @param publicId The public ID of the file to delete
   * @returns Deletion result
   */
  async deleteFileFromCloudinary(publicId: string) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return { result };
    } catch (error) {
      throw new BadRequestException(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * Deletes multiple files from Cloudinary
   * @param publicIds Array of public IDs to delete
   * @returns Array of deletion results
   */
  async deleteMultipleFilesFromCloudinary(publicIds: string[]) {
    try {
      const result = await cloudinary.api.delete_resources(publicIds);
      return { result };
    } catch (error) {
      throw new BadRequestException(`Failed to delete files: ${error.message}`);
    }
  }
}
