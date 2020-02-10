import { Cart } from '@app/database/entities';
import { Injectable } from '@nestjs/common';
import {
  ChatPostMessageArguments,
  SectionBlock,
  WebClient,
} from '@slack/client';

@Injectable()
export class SlackService {
  private readonly slackClient = new WebClient(process.env.SLACK_TOKEN);

  async cartMessage(cart: Cart, name: string, error?: string) {
    const blocks: SectionBlock[] = [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text:
            '*New checkout:* ' +
            name +
            '\n<https://app.forestadmin.com/48314/data/2108279/index/record/2108279/' +
            cart.id +
            '/summary|' +
            cart.id +
            '>',
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: '*Completed:*\n' + new Date().toLocaleString(),
          },
          {
            type: 'mrkdwn',
            text: '*Protection Plan:*\n' + (cart.protectionPlan ? 'YES' : 'NO'),
          },
          {
            type: 'mrkdwn',
            text: '*Service:*\n' + cart.service,
          },
          {
            type: 'mrkdwn',
            text: '*Plan:*\n' + cart.planId,
          },
        ],
      },
    ];

    if (error) {
      blocks[1].fields.push({
        type: 'mrkdwn',
        text: '*:red_circle: Reason:*\n' + error,
      });
    }

    return this.sendMessage('CGX5HELCT', blocks);
  }

  async sendMessage(
    channel: string,
    blocks: ChatPostMessageArguments['blocks'],
  ) {
    return this.slackClient.chat.postMessage({
      channel,
      text: '',
      blocks,
    });
  }
}
