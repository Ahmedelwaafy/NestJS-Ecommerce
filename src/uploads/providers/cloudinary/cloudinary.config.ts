import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

export const CloudinaryConfig = {
  provide: 'CLOUDINARY',
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    return cloudinary.config({
      cloud_name: configService.get<string>('appConfig.cloudinaryName'),
      api_key: configService.get<string>('appConfig.cloudinaryApiKey'),
      api_secret: configService.get<string>('appConfig.cloudinaryApiSecret'),
    });
  },
};
