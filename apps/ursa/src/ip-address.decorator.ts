import { createParamDecorator } from '@nestjs/common';
import requestIp from 'request-ip';

export const IpAddress = createParamDecorator(
  (data, [root, args, ctx, info]): string => {
    if (ctx.req.clientIp) return ctx.req.clientIp;
    return requestIp.getClientIp(ctx.req);
  },
);
