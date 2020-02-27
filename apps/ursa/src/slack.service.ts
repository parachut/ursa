import { Cart } from '@app/database/entities';
import { Injectable } from '@nestjs/common';
import {
  ChatPostMessageArguments,
  SectionBlock,
  WebClient,
} from '@slack/client';
import { RegisterAffiliateInput } from './auth/dto/register-affiliate.input';

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

  async affiliateMessage(input: RegisterAffiliateInput) {
    const blocks: SectionBlock[] = [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*New affiliate submission:*',
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: '*Name:*\n ' + input.first + ' ' + input.last,
          },
          {
            type: 'mrkdwn',
            text: '*Email:*\n ' + (input.email || ''),
          },
          {
            type: 'mrkdwn',
            text: '*Phone:*\n ' + (input.phone || ''),
          },
          {
            type: 'mrkdwn',
            text: '*Instagram:*\n ' + (input.instagram || ''),
          },
          {
            type: 'mrkdwn',
            text: '*Followers:*\n ' + (input.followers || ''),
          },
          {
            type: 'mrkdwn',
            text: '*Business Name:*\n ' + (input.businessName || ''),
          },
          {
            type: 'mrkdwn',
            text: '*Website:*\n ' + (input.website || ''),
          },
          {
            type: 'mrkdwn',
            text: '*Location:*\n ' + (input.location || ''),
          },
          {
            type: 'mrkdwn',
            text: '*Traffic:*\n ' + (input.traffic || ''),
          },
          {
            type: 'mrkdwn',
            text: '*Affiliate Type:*\n ' + (input.affiliateType || ''),
          },
        ],
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*Purpose of site:*\n ' + (input.purpose || ''),
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*Demographic:*\n ' + (input.demographic || ''),
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*Planning to promote:*\n ' + (input.promote || ''),
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*Two brands a good match:*\n ' + (input.brands || ''),
        },
      },
    ];

    return this.sendMessage('CUDMSJ9F0', blocks);
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
