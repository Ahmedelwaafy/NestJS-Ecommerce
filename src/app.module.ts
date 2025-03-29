import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import environmentValidation from './config/environment.validation';
import jwtConfig from './config/jwt.config';
import { DataResponseInterceptor } from './common/interceptors/data-response/data-response.interceptor';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { PaginationModule } from './common/pagination/pagination.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import securityConfig from './config/security.config';
import { MailModule } from './mail/mail.module';
import { CategoryModule } from './category/category.module';

const ENV = process.env.NODE_ENV;
//console.log({ ENV });
@Module({
  imports: [
    UserModule,
    AuthModule,
    PaginationModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: !ENV ? '.env' : `.env.${ENV}`,
      load: [appConfig, databaseConfig, jwtConfig, securityConfig],
      validationSchema: environmentValidation,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('database.uri'),
        dbName: configService.get<string>('database.dbName'),
      }),
    }),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        // Use userSecret as the default
        secret: configService.get<string>('jwt.userSecret'),
        signOptions: {
          expiresIn: `${configService.get<number>('jwt.accessTokenTtl')}s`,
          audience: configService.get<string>('jwt.audience'),
          issuer: configService.get<string>('jwt.issuer'),
        },
      }),
    }),
    MailModule,
    CategoryModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: DataResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
