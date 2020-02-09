import { User } from '@app/database/entities';
import { Injectable, Logger } from '@nestjs/common';
import * as Recurly from 'recurly';

@Injectable()
export class RecurlyService {
  private readonly logger = new Logger(RecurlyService.name);

  private readonly recurlyClient = new Recurly.Client(process.env.RECURLY);

  findRecurlyIntegration(user: User) {
    return user.integrations.find(int => int.type === 'RECURLY')?.value;
  }
}
