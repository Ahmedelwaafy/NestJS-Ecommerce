import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController, UserProfileController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { AuthModule } from 'src/auth/auth.module';
import { CreateUserProvider } from './providers/create-user.provider';
import { PaginationModule } from 'src/common/pagination/pagination.module';
import { FindUserByEmailProvider } from './providers/find-user-by-email.provider';
import { FindUserByIdProvider } from './providers/find-user-by-id.provider';
import { FindUserByGoogleIdProvider } from './providers/find-user-by-google-id.provider';
import { CreateGoogleUserProvider } from './providers/create-google-user.provider';

@Module({
  imports: [
    PaginationModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    forwardRef(() => AuthModule),
  ],
  controllers: [UserController, UserProfileController],
  providers: [
    UserService,
    CreateUserProvider,
    FindUserByIdProvider,
    FindUserByGoogleIdProvider,
    FindUserByEmailProvider,
    CreateGoogleUserProvider,
  ],
  exports: [UserService],
})
export class UserModule {}
