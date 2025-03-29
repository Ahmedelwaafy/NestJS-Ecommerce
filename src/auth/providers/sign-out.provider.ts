import {
  Injectable
} from '@nestjs/common';
import { Response } from 'express';
import {
  ACCESS_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
} from '../constants/auth.constants';

@Injectable()
export class SignOutProvider {
  constructor() {}

  public async signOut(response: Response) {
    // Clear access token cookie
    response.cookie(ACCESS_TOKEN_COOKIE_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' ? true : false,
      sameSite: process.env.NODE_ENV === 'production' ? 'lax' : false,
      maxAge: 0, // Expires immediately
      path: '/',
    });

    // Clear refresh token cookie
    response.cookie(REFRESH_TOKEN_COOKIE_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' ? true : false,
      sameSite: process.env.NODE_ENV === 'production' ? 'lax' : false,
      maxAge: 0, // Expires immediately
      path: '/auth/refresh', // Use the same path that was used when setting the cookie
    });

    return;
  }
}
