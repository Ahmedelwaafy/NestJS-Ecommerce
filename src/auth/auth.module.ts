import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthGuard } from './guards/auth.guard';
import { HashingProvider } from './providers/hashing.provider';
import { AuthService } from './auth.service';
import { BcryptProvider } from './providers/bcrypt.provider';
import { UserModule } from 'src/user/user.module';
import { SignInProvider } from './providers/sign-in.provider';
import { GenerateTokensProvider } from './providers/generate-tokens.provider';
import { SignOutProvider } from './providers/sign-out.provider';
import { RefreshTokenProvider } from './providers/refresh-token.provider';
import { ForgetPasswordProvider } from './providers/forget-password.provider';
import { GoogleAuthenticationService } from './OAuth/providers/google-authentication.service';

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
    RefreshTokenProvider,
    ForgetPasswordProvider,
    GoogleAuthenticationService,
  ],
  imports: [forwardRef(() => UserModule)],
  exports: [AuthService, HashingProvider, AuthGuard],
})
export class AuthModule {}
