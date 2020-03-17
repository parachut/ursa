import { Cart, Return, ShipKit, User } from '@app/database/entities';
import { Injectable } from '@nestjs/common';
import {
  ChatPostMessageArguments,
  SectionBlock,
  WebClient,
} from '@slack/client';
import numeral from 'numeral';

interface AffiliateInput {
  email: string;
  first: string;
  last: string;
  phone: string;
  instagram?: string;
  businessName?: string;
  website?: string;
}

@Injectable()
export class SlackService {
  private readonly slackClient = new WebClient(process.env.SLACK_TOKEN);

  async cartMessage({
    cart,
    name,
    error,
    affiliate,
  }: {
    cart: Cart;
    name: string;
    error?: string;
    affiliate: User;
  }) {
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
          {
            type: 'mrkdwn',
            text: '*Affiliate:*\n' + (affiliate ? affiliate.name : 'None'),
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

  async affiliateMessage(input: AffiliateInput) {
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
            text: '*Business Name:*\n ' + (input.businessName || ''),
          },
          {
            type: 'mrkdwn',
            text: '*Website:*\n ' + (input.website || ''),
          },
        ],
      },
    ];

    return this.sendMessage('CUDMSJ9F0', blocks);
  }

  async shipKitMessage({
    shipKit,
    value,
    shipments,
    user,
    affiliate,
  }: {
    shipKit: ShipKit;
    value: number;
    shipments: number;
    user: User;
    affiliate: User;
  }) {
    const blocks: SectionBlock[] = [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text:
            '*New ship kit:* ' +
            user.name +
            '\n<https://app.forestadmin.com/Parachut/Production/Operations/data/2309969/index/record/2309969/' +
            shipKit.id +
            '/summary|' +
            shipKit.id +
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
            text: '*Airbox:*\n' + (shipKit.airbox ? 'Yes' : 'No'),
          },
          {
            type: 'mrkdwn',
            text: '*Value:*\n' + numeral(value).format('$0,00.00'),
          },
          {
            type: 'mrkdwn',
            text: '*Shipments:*\n' + shipments,
          },
          {
            type: 'mrkdwn',
            text: '*Affiliate:*\n' + (affiliate ? affiliate.name : 'None'),
          },
        ],
      },
    ];

    return this.sendMessage('CK3807X3L', blocks);
  }

  async returnMessage({
    _return,
    value,
    shipments,
    user,
  }: {
    _return: Return;
    value: number;
    shipments: number;
    user: User;
  }) {
    const blocks: SectionBlock[] = [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text:
            '*New ship kit:* ' +
            user.name +
            '\n<https://app.forestadmin.com/Parachut/Production/Operations/data/2309969/index/record/2309969/' +
            _return.id +
            '/summary|' +
            _return.id +
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
            text: '*Value:*\n' + numeral(value).format('$0,00.00'),
          },
          {
            type: 'mrkdwn',
            text: '*Shipments:*\n' + shipments,
          },
        ],
      },
    ];

    return this.sendMessage('CK3807X3L', blocks);
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
