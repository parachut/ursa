import { Injectable } from '@nestjs/common';

@Injectable()
export class RecurlyService {
  getHello(): string {
    return 'Recurly!';
  }
}
