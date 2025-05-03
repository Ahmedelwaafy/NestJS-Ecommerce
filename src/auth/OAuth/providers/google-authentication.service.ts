import {
  forwardRef,
  Inject,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { GenerateTokensProvider } from 'src/auth/providers/generate-tokens.provider';
import { GoogleTokenDto } from '../dtos/google-token.dto';
import { ConfigType } from '@nestjs/config';
import { UserService } from 'src/user/user.service';
import jwtConfig from 'src/config/jwt.config';

@Injectable()
export class GoogleAuthenticationService implements OnModuleInit {
  private oauthClient: OAuth2Client;

  constructor(
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,

    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    
    private readonly generateTokensProvider: GenerateTokensProvider,
  ) {}

  onModuleInit() {
    const clientId = this.jwtConfiguration.googleClientId;
    const clientSecret = this.jwtConfiguration.googleClientSecret;
    this.oauthClient = new OAuth2Client(clientId, clientSecret);
  }

  public async authenticate(googleTokenDto: GoogleTokenDto) {
    try {
      //verify the google token
      const loginTicket = await this.oauthClient.verifyIdToken({
        idToken: googleTokenDto.token,
      });

      //extract the payload from the token
      const {
        email,
        sub: googleId,
        given_name: firstName,
        family_name: lastName,
      } = loginTicket.getPayload();

      //fetch the user from the database based on the google id

      const user = await this.userService.findOneByGoogleId(googleId);

      //if a user with this google id exists, generate tokens and return

      if (user) {
        return this.generateTokensProvider.generateTokens(user);
      }

      //if a user with this google id does not exist, create a new user

      const newUser = await this.userService.createGoogleUser({
        email,
        name:firstName+" "+lastName,
        googleId,
      });

      return this.generateTokensProvider.generateTokens(newUser);
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }
}
