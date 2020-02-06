import { User } from '@app/database/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Client as Authy } from 'authy-client';

@Injectable()
export class AuthService {
  private readonly authyClient: any;

  constructor(private readonly jwtService: JwtService) {
    this.authyClient = new Authy({ key: process.env.AUTHY });
  }

  private async findAuthyId(phone: string) {
    const user = await User.findOne({
      where: { phone },
      include: ['integrations'],
    });

    if (!user) {
      throw new Error('No user with that phone number.');
    }

    const authyIntegration = user.integrations.find(
      integration => integration.type === 'AUTHY',
    );

    return authyIntegration.value;
  }

  async request(phone: string, method: string): Promise<any> {
    const authyId = await this.findAuthyId(phone);

    if (method === 'call') {
      return this.authyClient.requestCall({
        authyId,
      });
    }

    return this.authyClient.requestSms({
      authyId,
    });
  }

  async verify(phone: string, token: string): Promise<any> {
    const authyId = await this.findAuthyId(phone);

    return this.authyClient.verifyToken({
      authyId,
      token,
    });
  }
}
