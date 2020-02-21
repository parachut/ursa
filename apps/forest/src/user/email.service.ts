import { Injectable } from '@nestjs/common';
import Postmark from 'postmark';

interface SendArgs {
  data: any;
  from?: string;
  to: string;
  id: number;
  attachments?: [
    {
      Name: string;
      Content: string;
      ContentType: string;
      ContentID: string;
    },
  ];
}

@Injectable()
export class EmailService {
  private readonly postmarkClient = new Postmark.ServerClient(
    process.env.POSTMARK,
  );

  async send(email: SendArgs) {
    const {
      data = {},
      from = 'support@parachut.co',
      id,
      to,
      attachments,
    } = email;

    return this.postmarkClient.sendEmailWithTemplate({
      From: from,
      TemplateId: id,
      TemplateModel: data,
      To: to,
      Attachments: attachments,
    });
  }
}
