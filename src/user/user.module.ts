import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController, UserProfileController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { AuthModule } from 'src/auth/auth.module';
import { CreateUserProvider } from './providers/create-user.provider';
import { PaginationModule } from 'src/common/pagination/pagination.module';
import { FindUserByIdProvider } from './providers/find-user-by-id.provider';

@Module({
  imports: [
    PaginationModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    forwardRef(() => AuthModule),
  ],
  controllers: [UserController, UserProfileController],
  providers: [UserService, CreateUserProvider, FindUserByIdProvider],
})
export class UserModule {}
