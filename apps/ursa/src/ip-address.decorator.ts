import { createParamDecorator } from '@nestjs/common';
import * as requestIp from 'request-ip';

export const IpAddress = createParamDecorator(
  (data, [root, args, ctx, info]) => {
    if (ctx.req.clientIp) return ctx.req.clientIp;
    return requestIp.getClientIp(ctx.req);
  },
);
