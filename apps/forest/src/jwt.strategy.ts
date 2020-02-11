import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

const REGEX_COOKIE_SESSION_TOKEN = /forest_session_token=([^;]*)/;

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: request => {
        if (request.headers) {
          if (
            request.headers.authorization &&
            request.headers.authorization.split(' ')[0] === 'Bearer'
          ) {
            return request.headers.authorization.split(' ')[1];
          }
          // NOTICE: Necessary for downloads authentication.
          if (request.headers.cookie) {
            const match = request.headers.cookie.match(
              REGEX_COOKIE_SESSION_TOKEN,
            );
            if (match && match[1]) {
              return match[1];
            }
          }
        }
        return null;
      },
      ignoreExpiration: false,
      secretOrKey: process.env.FOREST_AUTH_SECRET,
    });
  }

  async validate(payload: any) {
    return payload;
  }
}
