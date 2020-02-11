import { createParamDecorator } from '@nestjs/common';

export const DeviceId = createParamDecorator(
  (data, [root, args, ctx, info]): string => {
    return ctx.req.header('x-device-id');
  },
);
