import { GooglePubSub } from '@axelspringer/graphql-google-pubsub';
import { PubSub } from 'graphql-subscriptions';

export const pubSubProvider = {
  provide: 'PUB_SUB',
  useFactory: () => {
    if (process.env.NODE_ENV === 'production') {
      return new GooglePubSub();
    } else {
      return new PubSub();
    }
  },
};
