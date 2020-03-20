import { Injectable } from '@nestjs/common';
import Twilio from 'twilio';

console.log(process.env.TWILIO_SID);

@Injectable()
export class TwilioService {
  private readonly twilioClient = Twilio(
    process.env.TWILIO_SID,
    process.env.TWILIO_TOKEN,
  );

  async sendMessage(body: string, to: string, from = '+13858812488') {
    return this.twilioClient.messages.create({
      body,
      to,
      from,
    });
  }
}
