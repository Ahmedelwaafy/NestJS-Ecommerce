import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthGuard } from './gaurds/auth.guard';
import { HashingProvider } from './providers/hashing.provider';
import { AuthService } from './auth.service';
import { BcryptProvider } from './providers/bcrypt.provider';
import { UserModule } from 'src/user/user.module';
import { SignInProvider } from './providers/sign-in.provider';
import { GenerateTokensProvider } from './providers/generate-tokens.provider';
import { SignOutProvider } from './providers/sign-out.provider';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: HashingProvider,
      useClass: BcryptProvider,
    },
    AuthGuard,
    SignInProvider,
    SignOutProvider,
    GenerateTokensProvider,
  ],
  imports: [forwardRef(() => UserModule)],
  exports: [AuthService, HashingProvider, AuthGuard],
})
export class AuthModule {}
