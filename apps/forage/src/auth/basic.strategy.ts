import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { BasicStrategy as Strategy } from 'passport-http';

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy) {
  private logger = new Logger('BasicStrategy');

  async validate(username: string, password: string): Promise<any> {
    if (
      !username ||
      !password ||
      username !== process.env.USERNAME ||
      password !== process.env.PASSWORD
    ) {
      throw new UnauthorizedException();
    }

    return true;
  }
}
