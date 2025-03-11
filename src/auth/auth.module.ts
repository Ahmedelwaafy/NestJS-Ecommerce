import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthGuard } from './gaurds/auth.guard';
import { HashingProvider } from './providers/hashing.provider';
import { AuthService } from './providers/auth.service';
import { BcryptProvider } from './providers/bcrypt.provider';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: HashingProvider,
      useClass: BcryptProvider,
    },
    AuthGuard,
  ],
  imports: [],
  exports: [AuthService, HashingProvider, AuthGuard],
})
export class AuthModule {}
